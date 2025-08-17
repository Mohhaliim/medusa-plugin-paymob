"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/utils");
const medusa_1 = require("@medusajs/medusa");
const crypto_1 = __importDefault(require("crypto"));
class PaymobPaymentService extends medusa_1.AbstractPaymentProcessor {
    constructor(container, options) {
        var _a;
        super(container, options);
        if (!options.secret_key || !options.public_key) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, 'The Paymob provider requires secret_key and public_key options');
        }
        if (!((_a = options.integration_ids) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, 'The Paymob provider requires at least one integration_id');
        }
        this.configuration = options;
        this.debug = Boolean(options.debug);
    }
    /**
     * Called when a user selects Paymob as their payment method
     */
    async initiatePayment(context) {
        if (this.debug) {
            console.info('PM_Debug: InitiatePayment', JSON.stringify(context, null, 2));
        }
        const { amount, currency_code, billing_address, email, resource_id } = context;
        if (!email || !billing_address) {
            return this.buildError('Email and billing address are required', {
                detail: 'Email and billing address are required to initiate a Paymob payment',
            });
        }
        const redirectionLink = `${this.configuration.domain}${billing_address.address_2}/shop/checkout/status?cart_id=${resource_id}`;
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
        }
        catch (error) {
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
    async authorizePayment(paymentSessionData, context) {
        if (this.debug) {
            console.info('PS_P_Debug: authorize payment', JSON.stringify(paymentSessionData, null, 2));
        }
        switch (context.state) {
            case 'captured':
                return {
                    status: utils_1.PaymentSessionStatus.AUTHORIZED,
                    data: {
                        ...paymentSessionData,
                        state: context.state,
                        transaction_id: context.transaction_id
                    },
                };
            case 'failed':
            case 'declined':
                return {
                    status: utils_1.PaymentSessionStatus.ERROR,
                    data: {
                        ...paymentSessionData,
                        transaction_id: context.transaction_id
                    },
                };
            default:
                return {
                    status: utils_1.PaymentSessionStatus.PENDING,
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
    async retrievePayment(paymentSessionData) {
        if (this.debug) {
            console.info('PS_P_Debug: RetrievePayment', JSON.stringify(paymentSessionData, null, 2));
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
    async updatePayment(context) {
        console.log('cart is updated');
        return this.initiatePayment(context);
    }
    /**
     * capturePayment
     * Called when payment needs to be captured
     */
    async capturePayment(paymentSessionData) {
        // Paymob payments are captured automatically
        if (this.debug) {
            console.info('PS_P_Debug: capture payment', JSON.stringify(paymentSessionData, null, 2));
        }
        return paymentSessionData;
    }
    /**
     * Called when payment needs to be refunded
     */
    async refundPayment(paymentSessionData, refundAmount) {
        if (this.debug) {
            console.info('PS_P_Debug: refund payment', JSON.stringify(paymentSessionData, null, 2));
        }
        try {
            const response = await fetch('https://accept.paymob.com/api/acceptance/void_refund/refund', {
                method: 'POST',
                headers: {
                    Authorization: `Token ${this.configuration.secret_key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transaction_id: paymentSessionData.transaction_id,
                    amount_cents: refundAmount,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || response.statusText);
            }
            const data = await response.json();
            const { id, data: { captured_amount, refunded_amount, migs_order: { status } }, } = data;
            const refund_data = { id,
                captured_amount,
                refunded_amount,
                status };
            return {
                ...paymentSessionData,
                refund_data
            };
        }
        catch (error) {
            return this.buildError('Failed to refund payment', error);
        }
    }
    /**
     * Called to check payment status
     */
    async getPaymentStatus(paymentSessionData) {
        if (this.debug) {
            console.info('PS_P_Debug: payment status', JSON.stringify(paymentSessionData, null, 2));
        }
        const { transaction_id, state } = paymentSessionData;
        if (!transaction_id) {
            return utils_1.PaymentSessionStatus.PENDING;
        }
        switch (state) {
            case 'captured':
                return utils_1.PaymentSessionStatus.AUTHORIZED;
            case 'declined':
            case 'voided':
                return utils_1.PaymentSessionStatus.ERROR;
            default:
                return utils_1.PaymentSessionStatus.PENDING;
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
            }
            else {
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
    async getWebhookActionAndData(data) {
        if (this.debug) {
            console.info('PM_Debug: Webhook received', data);
        }
        const { body: { obj, obj: { success, is_refunded, id, payment_key_claims: { extra: { resource_id } } }, type }, paymobHMAC } = data;
        if (!paymobHMAC) {
            return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
        const concatenatedValues = await this.createHmacString(obj);
        const calculatedHmac = crypto_1.default
            .createHmac('sha512', this.configuration.hmac)
            .update(concatenatedValues)
            .digest('hex');
        if (paymobHMAC !== calculatedHmac) {
            return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
        const paymobType = type;
        const state = success;
        const transaction_id = id;
        const cart_id = resource_id;
        const paymobRefunded = is_refunded;
        switch (paymobType) {
            case 'TRANSACTION':
                if (!transaction_id) {
                    return { action: utils_1.PaymentActions.NOT_SUPPORTED };
                }
                if (!state) {
                    return {
                        action: utils_1.PaymentActions.FAILED,
                        data: {
                            resource_id: cart_id,
                            amount: data.body.obj.amount_cents,
                            transaction_id: transaction_id
                        },
                    };
                }
                if (state && paymobRefunded) {
                    return {
                        action: utils_1.PaymentActions.NOT_SUPPORTED,
                        data: {
                            resource_id: cart_id,
                            amount: data.body.obj.amount_cents,
                            transaction_id: transaction_id
                        },
                    };
                }
                return {
                    action: utils_1.PaymentActions.SUCCESSFUL,
                    data: {
                        resource_id: cart_id,
                        amount: data.body.obj.amount_cents,
                        transaction_id: transaction_id
                    },
                };
            default:
                return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
    }
    /**
     * Cancel payment (not supported by Paymob)
     */
    async cancelPayment(paymentSessionData) {
        if (this.debug) {
            console.info('PS_P_Debug: cancel payment', JSON.stringify(paymentSessionData, null, 2));
        }
        return paymentSessionData;
    }
    /*
     * updates payment data  (not supported by Paymob)
     */
    async updatePaymentData(sessionId, data) {
        return data;
    }
    /**
     * Delete payment (not supported by Paymob)
     */
    async deletePayment(paymentSessionData) {
        if (this.debug) {
            console.info('PS_P_Debug: update payment', JSON.stringify(paymentSessionData, null, 2));
        }
        return paymentSessionData;
    }
    buildError(message, e) {
        const errorMessage = 'Paymob Payment error: ' + message;
        let code;
        let detail;
        if (e instanceof Error) {
            code = e.message;
            detail = e.stack;
        }
        else if (typeof e === 'object' && e !== null && 'detail' in e) {
            detail = e.detail;
        }
        return {
            error: errorMessage,
            code: code !== null && code !== void 0 ? code : '',
            detail: detail !== null && detail !== void 0 ? detail : '',
        };
    }
}
PaymobPaymentService.identifier = 'paymob';
exports.default = PaymobPaymentService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bW9iLXBheW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvcGF5bW9iLXBheW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFNQSwyQ0FJeUI7QUFFekIsNkNBSzBCO0FBRTFCLG9EQUE0QjtBQWlENUIsTUFBTSxvQkFBcUIsU0FBUSxpQ0FBd0I7SUFNekQsWUFDRSxTQUFnRCxFQUNoRCxPQUFxQzs7UUFFckMsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUxQixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDOUMsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUNsQyxnRUFBZ0UsQ0FDakUsQ0FBQztTQUNIO1FBRUQsSUFBSSxDQUFDLENBQUEsTUFBQSxPQUFPLENBQUMsZUFBZSwwQ0FBRSxNQUFNLENBQUEsRUFBRTtZQUNwQyxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQ2xDLDBEQUEwRCxDQUMzRCxDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGVBQWUsQ0FDbkIsT0FBZ0M7UUFFaEMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2QsT0FBTyxDQUFDLElBQUksQ0FDViwyQkFBMkIsRUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUNqQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsS0FB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