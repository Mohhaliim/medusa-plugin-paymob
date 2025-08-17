import { PaymentProviderService } from '@medusajs/medusa';
import { PaymentContext, Cart } from '@medusajs/medusa';
import { PaymentSessionInput } from '@medusajs/medusa/dist/types/payment';

export class PaymentProviderServiceExtension extends PaymentProviderService {
  /**
   * Build the create session context for both legacy and new API
   * @param cartOrData
   * @protected
   */
  protected buildPaymentProcessorContext(
    cartOrData: Cart | PaymentSessionInput
  ): Cart & PaymentContext {
    const cart =
      'object' in cartOrData && cartOrData.object === 'cart'
        ? cartOrData
        : ((cartOrData as PaymentSessionInput).cart as Cart);

    const context = {} as Cart & PaymentContext;

    if ('object' in cartOrData && cartOrData.object === 'cart') {
      context.cart = {
        context: cart.context,
        shipping_address: cart.shipping_address,
        billing_address: cart.billing_address ?? cart.shipping_address, // Set billing address to shipping address if billing unavailable
        id: cart.id,
        email: cart.email,
        shipping_methods: cart.shipping_methods,
      };
      context.amount = cart.total!;
      context.currency_code = cart.region?.currency_code;
      context.resource_id = cart.id;
      Object.assign(context, cart);
    } else {
      const data = cartOrData as PaymentSessionInput;
      context.cart = data.cart;
      context.amount = data.amount;
      context.currency_code = data.currency_code;
      context.resource_id = data.resource_id ?? data.cart.id;
      context.billing_address =
        data.cart.billing_address ?? data.cart.shipping_address; // Added billing address here
      Object.assign(context, cart);
    }

    return context;
  }
}

export default PaymentProviderServiceExtension;
