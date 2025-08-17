"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const POST = async (req, res) => {
    const body = req.body;
    const query = req.query;
    const paymobService = req.scope.resolve('paymobPaymentService');
    const manager = req.scope.resolve('manager');
    const result = await paymobService.getWebhookActionAndData({
        body,
        paymobHMAC: query.hmac,
    });
    if (result.action !== 'not_supported') {
        await manager.transaction(async (transactionManager) => {
            const cartServiceTx = req.scope
                .resolve('cartService')
                .withTransaction(transactionManager);
            const orderServiceTx = req.scope
                .resolve('orderService')
                .withTransaction(transactionManager);
            const context = {
                resource_id: result.data.resource_id,
                state: result.action,
                transaction_id: result.data.transaction_id
            };
            if (result.action === 'captured') {
                await cartServiceTx.authorizePayment(result.data.resource_id, context);
                await orderServiceTx.createFromCart(result.data.resource_id);
            }
            else if (result.action === 'failed') {
                await cartServiceTx.authorizePayment(result.data.resource_id, context);
            }
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL3dlYmhvb2tzL3BheW1vYi9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFTTyxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDcEUsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztJQUN0QixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBRXhCLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUNyQyxzQkFBc0IsQ0FDdkIsQ0FBQztJQUNGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFnQixTQUFTLENBQUMsQ0FBQztJQUM1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztRQUN6RCxJQUFJO1FBQ0osVUFBVSxFQUFFLEtBQUssQ0FBQyxJQUFjO0tBQ2pDLENBQUMsQ0FBQztJQUVILElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxlQUFlLEVBQUU7UUFDckMsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxFQUFFO1lBQ3JELE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLO2lCQUM1QixPQUFPLENBQWMsYUFBYSxDQUFDO2lCQUNuQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN2QyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSztpQkFDN0IsT0FBTyxDQUFlLGNBQWMsQ0FBQztpQkFDckMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFdkMsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDcEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dCQUNwQixjQUFjLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjO2FBQzNDLENBQUM7WUFFRixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFO2dCQUNoQyxNQUFNLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDdkUsTUFBTSxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDOUQ7aUJBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDckMsTUFBTSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDeEU7UUFDSCxDQUFDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQyxDQUFDO0FBcENXLFFBQUEsSUFBSSxRQW9DZiJ9