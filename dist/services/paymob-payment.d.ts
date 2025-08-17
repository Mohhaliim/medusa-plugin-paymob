/// <reference types="node" />
import { MedusaContainer, WebhookActionData } from '@medusajs/types';
import { PaymentSessionStatus, PaymentActions } from '@medusajs/utils';
import { AbstractPaymentProcessor, PaymentProcessorContext, PaymentProcessorError, PaymentProcessorSessionResponse } from '@medusajs/medusa';
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
    domain?: string;
}
type ExtendedWebhookActionResult = {
    action: PaymentActions.NOT_SUPPORTED;
} | {
    action: PaymentActions;
    data: WebhookActionData & {
        transaction_id: string;
    };
};
declare class PaymobPaymentService extends AbstractPaymentProcessor {
    static identifier: string;
    protected readonly configuration: PaymobPaymentProcessorConfig;
    protected readonly debug: boolean;
    constructor(container: Record<string, any> & MedusaContainer, options: PaymobPaymentProcessorConfig);
    /**
     * Called when a user selects Paymob as their payment method
     */
    initiatePayment(context: PaymentProcessorContext): Promise<PaymentProcessorError | PaymentProcessorSessionResponse>;
    authorizePayment(paymentSessionData: Record<string, unknown>, context: Record<string, unknown>): Promise<PaymentProcessorError | {
        status: PaymentSessionStatus;
        data: Record<string, unknown>;
    }>;
    retrievePayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown> | PaymentProcessorError>;
    /**
     * Called when cart is updated
     */
    updatePayment(context: PaymentProcessorContext): Promise<PaymentProcessorError | PaymentProcessorSessionResponse>;
    /**
     * capturePayment
     * Called when payment needs to be captured
     */
    capturePayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown> | PaymentProcessorError>;
    /**
     * Called when payment needs to be refunded
     */
    refundPayment(paymentSessionData: Record<string, unknown> & {
        transaction_id: string;
    }, refundAmount: number): Promise<Record<string, unknown> | PaymentProcessorError>;
    /**
     * Called to check payment status
     */
    getPaymentStatus(paymentSessionData: Record<string, unknown> & {
        transaction_id?: string;
    }): Promise<PaymentSessionStatus>;
    flattenObject(obj: any, parent?: string, res?: {}): Promise<{}>;
    createHmacString(data: any): Promise<string>;
    getWebhookActionAndData(data: {
        body: any;
        paymobHMAC: string | Buffer;
    }): Promise<ExtendedWebhookActionResult>;
    /**
     * Cancel payment (not supported by Paymob)
     */
    cancelPayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown> | PaymentProcessorError>;
    updatePaymentData(sessionId: string, data: Record<string, unknown>): Promise<Record<string, unknown> | PaymentProcessorError>;
    /**
     * Delete payment (not supported by Paymob)
     */
    deletePayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown> | PaymentProcessorError>;
    protected buildError(message: string, e: unknown): PaymentProcessorError;
}
export default PaymobPaymentService;
