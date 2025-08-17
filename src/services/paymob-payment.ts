import {
  MedusaContainer,
  WebhookActionData,
  WebhookActionResult,
} from '@medusajs/types';

import {
  MedusaError,
  PaymentSessionStatus,
  PaymentActions,
} from '@medusajs/utils';

import {
  AbstractPaymentProcessor,
  PaymentProcessorContext,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
} from '@medusajs/medusa';

import crypto from 'crypto';

interface PaymobPaymentProcessorConfig extends Record<string, unknown> {
  /**
   * Paymob Secret Key
   * Obtainable from the Paymob dashboard
   */
  secret_key: string;

  /**
   * Paymob Public Key
   * Used for checkout integration
   */
  public_key: string;

  /**
   * Integration IDs for different payment methods
   * Get these from your Paymob dashboard
   */
  integration_ids: number[];

  /**
   * HMAC
   * Used for webhook validation
   * Get this from your Paymob dashboard
   */
  hmac: string;

  /**
   * Debug mode
   * If true, logs helpful debug information
   */
  debug?: boolean;

  /*
  * Frontend redirection domain
  */
  domain?: string
}

type ExtendedWebhookActionResult =
| {action: PaymentActions.NOT_SUPPORTED}
| {
  action: PaymentActions;
  data: WebhookActionData & {
    transaction_id: string
  }
}

class PaymobPaymentService extends AbstractPaymentProcessor {
  static identifier = 'paymob';

  protected readonly configuration: PaymobPaymentProcessorConfig;
  protected readonly debug: boolean;

  constructor(
    container: Record<string, any> & MedusaContainer,
    options: PaymobPaymentProcessorConfig
  ) {
    super(container, options);

    if (!options.secret_key || !options.public_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        'The Paymob provider requires secret_key and public_key options'
      );
    }

    if (!options.integration_ids?.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        'The Paymob provider requires at least one integration_id'
      );
    }

    this.configuration = options;
    this.debug = Boolean(options.debug);
  }

  /**
   * Called when a user selects Paymob as their payment method
   */
  async initiatePayment(
    context: PaymentProcessorContext
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    if (this.debug) {
      console.info(
        'PM_Debug: InitiatePayment',
        JSON.stringify(context, null, 2)
      );
    }

    const { amount, currency_code, billing_address, email, resource_id } =
      context;

    if (!email || !billing_address) {
      return this.buildError('Email and billing address are required', {
        detail:
          'Email and billing address are required to initiate a Paymob payment',
      });
    }

    const redirectionLink = `${this.configuration.domain}${billing_address.address_2}/shop/checkout/status?cart_id=${resource_id}`

    const body = JSON.stringify({
      amount: Number(amount),
      currency: currency_code.toUpperCase(),
      payment_methods: this.configuration.integration_ids,
      billing_data: {
        apartment: 'NA',
        first_name: billing_address.first_name,
        last_name: billing_address.last_name,
        street: billing_address.address_1,
        building: billing_address.address_2 || 'NA',
        phone_number: billing_address.phone || 'NA',
        city: billing_address.city,
        country: billing_address.country_code,
        email: email,
        floor: 'NA',
        state: billing_address.province || 'NA',
      },
      items: [
        {
          name: 'Order Payment',
          amount: Number(amount),
          description: 'Payment for order',
          quantity: 1,
        },
      ],
      extras: {
        resource_id: resource_id,
      },
      redirection_url: redirectionLink
    });

    try {
      const response = await fetch('https://accept.paymob.com/v1/intention/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.configuration.secret_key}`,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.configuration.public_key}&clientSecret=${data.client_secret}`;

      return {
        session_data: {
          client_secret: data.client_secret,
          intention_id: data.id,
          checkout_url: checkoutUrl,
          transaction_id: data.intention_order_id,
        },
      };
    } catch (error) {
      if (this.debug) {
        console.error('PM_Debug: InitiatePayment Error', error);
      }
      return this.buildError('Failed to initiate Paymob payment', error);
    }
  }

  /*
   * authorizePayment
   * Called when the user completes the payment
   */
  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProcessorError
    | { status: PaymentSessionStatus; data: Record<string, unknown> }
  > {
    if (this.debug) {
      console.info(
        'PS_P_Debug: authorize payment',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }

    switch (context.state) {
      case 'captured':
        return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: {
            ...paymentSessionData,
            state: context.state,
            transaction_id: context.transaction_id
          },
        };
      case 'failed':
      case 'declined':
        return {
          status: PaymentSessionStatus.ERROR,
          data: {
            ...paymentSessionData,
            transaction_id: context.transaction_id
          },
        };
      default:
        return {
          status: PaymentSessionStatus.PENDING,
          data: {
            ...paymentSessionData,
            transaction_id: context.transaction_id
          },
        };
    }
  }

  /*
   * retrievePayment
   * Called when the user completes the payment
   */
  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    if (this.debug) {
      console.info(
        'PS_P_Debug: RetrievePayment',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }

    const { transaction_id } = paymentSessionData;

    if (!transaction_id) {
      return this.buildError('No transaction ID found', {
        detail: 'Transaction ID is required to retrieve payment details',
      });
    }

    return {
      ...paymentSessionData,
    };
  }

  /**
   * Called when cart is updated
   */
  async updatePayment(
    context: PaymentProcessorContext
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    console.log('cart is updated');
    return this.initiatePayment(context);
  }

  /**
   * capturePayment
   * Called when payment needs to be captured
   */
  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    // Paymob payments are captured automatically
    if (this.debug) {
      console.info(
        'PS_P_Debug: capture payment',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }
    return paymentSessionData;
  }

  /**
   * Called when payment needs to be refunded
   */
  async refundPayment(
    paymentSessionData: Record<string, unknown> & { transaction_id: string },
    refundAmount: number
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    if (this.debug) {
      console.info(
        'PS_P_Debug: refund payment',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }

    try {
      const response = await fetch(
        'https://accept.paymob.com/api/acceptance/void_refund/refund',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${this.configuration.secret_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_id: paymentSessionData.transaction_id,
            amount_cents: refundAmount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      const {id, data: { captured_amount, refunded_amount, migs_order: {status} }, } = data;

      const refund_data = {id,
        captured_amount,
        refunded_amount,
        status}
      return {
        ...paymentSessionData,
        refund_data
      };
    } catch (error) {
      return this.buildError('Failed to refund payment', error);
    }
  }

  /**
   * Called to check payment status
   */
  async getPaymentStatus(
    paymentSessionData: Record<string, unknown> & { transaction_id?: string }
  ): Promise<PaymentSessionStatus> {
    if (this.debug) {
      console.info(
        'PS_P_Debug: payment status',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }

    const { transaction_id, state } = paymentSessionData;

    if (!transaction_id) {
      return PaymentSessionStatus.PENDING;
    }

    switch (state) {
      case 'captured':
        return PaymentSessionStatus.AUTHORIZED;
      case 'declined':
      case 'voided':
        return PaymentSessionStatus.ERROR;
      default:
        return PaymentSessionStatus.PENDING;
    }
  }

  /*
   *  Webhook calls handling
   */
  async flattenObject(obj, parent = '', res = {}) {
    for (let key in obj) {
      let propName = parent ? parent + '.' + key : key;
      if (typeof obj[key] == 'object' && !Array.isArray(obj[key])) {
        this.flattenObject(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
    return res;
  }

  async createHmacString(data) {
    const flattened = await this.flattenObject(data);
    const keys = [
      'amount_cents',
      'created_at',
      'currency',
      'error_occured',
      'has_parent_transaction',
      'id',
      'integration_id',
      'is_3d_secure',
      'is_auth',
      'is_capture',
      'is_refunded',
      'is_standalone_payment',
      'is_voided',
      'order.id',
      'owner',
      'pending',
      'source_data.pan',
      'source_data.sub_type',
      'source_data.type',
      'success',
    ];

    const concatenatedValues = keys
      .map((key) => {
        const value = flattened[key];
        return value !== undefined ? String(value) : '';
      })
      .join('');

    return concatenatedValues;
  }

  async getWebhookActionAndData(data: {
    body: any;
    paymobHMAC: string | Buffer;
  }): Promise<ExtendedWebhookActionResult> {
    if (this.debug) {
      console.info('PM_Debug: Webhook received', data);
    }

    const { body: { obj, obj: {success, is_refunded, id, payment_key_claims: { extra: {resource_id}}}, type }, paymobHMAC } = data

    if (!paymobHMAC) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    const concatenatedValues = await this.createHmacString(obj);
    const calculatedHmac = crypto
      .createHmac('sha512', this.configuration.hmac)
      .update(concatenatedValues)
      .digest('hex');

    if (paymobHMAC !== calculatedHmac) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    const paymobType = type as string;
    const state = success as boolean
    const transaction_id = id as string;
    const cart_id = resource_id;
    const paymobRefunded = is_refunded as boolean;

    switch (paymobType) {
      case 'TRANSACTION':
        if (!transaction_id) {
          return { action: PaymentActions.NOT_SUPPORTED };
        }

        if (!state) {
          return {
            action: PaymentActions.FAILED,
            data: {
              resource_id: cart_id,
              amount: data.body.obj.amount_cents,
              transaction_id: transaction_id
            },
          };
        }

        if( state && paymobRefunded) {
          return {
            action: PaymentActions.NOT_SUPPORTED,
            data: {
              resource_id: cart_id,
              amount: data.body.obj.amount_cents,
              transaction_id: transaction_id
            },
          }
        }

        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            resource_id: cart_id,
            amount: data.body.obj.amount_cents,
            transaction_id: transaction_id
          },
        };

      default:
        return { action: PaymentActions.NOT_SUPPORTED };
    }
  }

  /**
   * Cancel payment (not supported by Paymob)
   */
  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    if (this.debug) {
      console.info(
        'PS_P_Debug: cancel payment',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }
    return paymentSessionData;
  }

  /*
   * updates payment data  (not supported by Paymob)
   */
  async updatePaymentData(
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    return data;
  }

  /**
   * Delete payment (not supported by Paymob)
   */
  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    if (this.debug) {
      console.info(
        'PS_P_Debug: update payment',
        JSON.stringify(paymentSessionData, null, 2)
      );
    }
    return paymentSessionData;
  }

  protected buildError(message: string, e: unknown): PaymentProcessorError {
    const errorMessage = 'Paymob Payment error: ' + message;
    let code: string | undefined;
    let detail: string | undefined;

    if (e instanceof Error) {
      code = e.message;
      detail = e.stack;
    } else if (typeof e === 'object' && e !== null && 'detail' in e) {
      detail = (e as { detail: string }).detail;
    }

    return {
      error: errorMessage,
      code: code ?? '',
      detail: detail ?? '',
    };
  }
}

export default PaymobPaymentService;
