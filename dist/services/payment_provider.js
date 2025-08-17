"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderServiceExtension = void 0;
const medusa_1 = require("@medusajs/medusa");
class PaymentProviderServiceExtension extends medusa_1.PaymentProviderService {
    /**
     * Build the create session context for both legacy and new API
     * @param cartOrData
     * @protected
     */
    buildPaymentProcessorContext(cartOrData) {
        var _a, _b, _c, _d;
        const cart = 'object' in cartOrData && cartOrData.object === 'cart'
            ? cartOrData
            : cartOrData.cart;
        const context = {};
        if ('object' in cartOrData && cartOrData.object === 'cart') {
            context.cart = {
                context: cart.context,
                shipping_address: cart.shipping_address,
                billing_address: (_a = cart.billing_address) !== null && _a !== void 0 ? _a : cart.shipping_address,
                id: cart.id,
                email: cart.email,
                shipping_methods: cart.shipping_methods,
            };
            context.amount = cart.total;
            context.currency_code = (_b = cart.region) === null || _b === void 0 ? void 0 : _b.currency_code;
            context.resource_id = cart.id;
            Object.assign(context, cart);
        }
        else {
            const data = cartOrData;
            context.cart = data.cart;
            context.amount = data.amount;
            context.currency_code = data.currency_code;
            context.resource_id = (_c = data.resource_id) !== null && _c !== void 0 ? _c : data.cart.id;
            context.billing_address =
                (_d = data.cart.billing_address) !== null && _d !== void 0 ? _d : data.cart.shipping_address; // Added billing address here
            Object.assign(context, cart);
        }
        return context;
    }
}
exports.PaymentProviderServiceExtension = PaymentProviderServiceExtension;
exports.default = PaymentProviderServiceExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudF9wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9wYXltZW50X3Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUEwRDtBQUkxRCxNQUFhLCtCQUFnQyxTQUFRLCtCQUFzQjtJQUN6RTs7OztPQUlHO0lBQ08sNEJBQTRCLENBQ3BDLFVBQXNDOztRQUV0QyxNQUFNLElBQUksR0FDUixRQUFRLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssTUFBTTtZQUNwRCxDQUFDLENBQUMsVUFBVTtZQUNaLENBQUMsQ0FBRyxVQUFrQyxDQUFDLElBQWEsQ0FBQztRQUV6RCxNQUFNLE9BQU8sR0FBRyxFQUEyQixDQUFDO1FBRTVDLElBQUksUUFBUSxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtZQUMxRCxPQUFPLENBQUMsSUFBSSxHQUFHO2dCQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtnQkFDdkMsZUFBZSxFQUFFLE1BQUEsSUFBSSxDQUFDLGVBQWUsbUNBQUksSUFBSSxDQUFDLGdCQUFnQjtnQkFDOUQsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNYLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjthQUN4QyxDQUFDO1lBQ0YsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBTSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxhQUFhLENBQUM7WUFDbkQsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzlCO2FBQU07WUFDTCxNQUFNLElBQUksR0FBRyxVQUFpQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN6QixPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDN0IsT0FBTyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzNDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsTUFBQSxJQUFJLENBQUMsV0FBVyxtQ0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN2RCxPQUFPLENBQUMsZUFBZTtnQkFDckIsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsbUNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLDZCQUE2QjtZQUN4RixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM5QjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FDRjtBQTFDRCwwRUEwQ0M7QUFFRCxrQkFBZSwrQkFBK0IsQ0FBQyJ9