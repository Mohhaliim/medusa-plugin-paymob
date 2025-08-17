"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const medusa_1 = require("@medusajs/medusa");
async function orderCaptureHandler({ data, eventName, container, pluginOptions, }) {
    const orderService = container.resolve('orderService');
    const cartService = container.resolve('cartService');
    const paymentProvider = container.resolve('paymentProviderService');
    const order = await orderService.retrieve(data.id);
    const cart = await cartService.retrieve(order.cart_id);
    const payment = await paymentProvider.retrievePayment(cart.payment_id);
    if (payment.provider_id === 'paymob') {
        await orderService.capturePayment(data.id);
    }
}
exports.default = orderCaptureHandler;
exports.config = {
    event: medusa_1.OrderService.Events.PLACED,
    context: {
        subscriberId: 'order-capture-handler',
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItY2FwdHVyZS1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N1YnNjcmliZXJzL29yZGVyLWNhcHR1cmUtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FNMEI7QUFFWCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsRUFDaEQsSUFBSSxFQUNKLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxHQUN1QjtJQUNwQyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFlLGNBQWMsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQWMsYUFBYSxDQUFDLENBQUM7SUFDbEUsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FDdkMsd0JBQXdCLENBQ3pCLENBQUM7SUFFRixNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sSUFBSSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV2RSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEtBQUssUUFBUSxFQUFFO1FBQ3BDLE1BQU0sWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDNUM7QUFDSCxDQUFDO0FBbkJELHNDQW1CQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUscUJBQVksQ0FBQyxNQUFNLENBQUMsTUFBTTtJQUNqQyxPQUFPLEVBQUU7UUFDUCxZQUFZLEVBQUUsdUJBQXVCO0tBQ3RDO0NBQ0YsQ0FBQyJ9