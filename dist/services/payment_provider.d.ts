import { PaymentProviderService } from '@medusajs/medusa';
import { PaymentContext, Cart } from '@medusajs/medusa';
import { PaymentSessionInput } from '@medusajs/medusa/dist/types/payment';
export declare class PaymentProviderServiceExtension extends PaymentProviderService {
    /**
     * Build the create session context for both legacy and new API
     * @param cartOrData
     * @protected
     */
    protected buildPaymentProcessorContext(cartOrData: Cart | PaymentSessionInput): Cart & PaymentContext;
}
export default PaymentProviderServiceExtension;
