import {
  SubscriberConfig,
  OrderService,
  SubscriberArgs,
  CartService,
  PaymentProviderService,
} from '@medusajs/medusa';

export default async function orderCaptureHandler({
  data,
  eventName,
  container,
  pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService = container.resolve<OrderService>('orderService');
  const cartService = container.resolve<CartService>('cartService');
  const paymentProvider = container.resolve<PaymentProviderService>(
    'paymentProviderService'
  );

  const order = await orderService.retrieve(data.id);
  const cart = await cartService.retrieve(order.cart_id);
  const payment = await paymentProvider.retrievePayment(cart.payment_id);

  if (payment.provider_id === 'paymob') {
    await orderService.capturePayment(data.id);
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.PLACED,
  context: {
    subscriberId: 'order-capture-handler',
  },
};
