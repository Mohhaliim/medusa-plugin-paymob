import {
  MedusaRequest,
  MedusaResponse,
  CartService,
  OrderService,
} from '@medusajs/medusa';
import PaymobPaymentService from '../../../services/paymob-payment';
import { EntityManager } from 'typeorm';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body;
  const query = req.query;

  const paymobService = req.scope.resolve<PaymobPaymentService>(
    'paymobPaymentService'
  );
  const manager = req.scope.resolve<EntityManager>('manager');
  const result = await paymobService.getWebhookActionAndData({
    body,
    paymobHMAC: query.hmac as string,
  });

  if (result.action !== 'not_supported') {
    await manager.transaction(async (transactionManager) => {
      const cartServiceTx = req.scope
        .resolve<CartService>('cartService')
        .withTransaction(transactionManager);
      const orderServiceTx = req.scope
        .resolve<OrderService>('orderService')
        .withTransaction(transactionManager);

      const context = {
        resource_id: result.data.resource_id,
        state: result.action,
        transaction_id: result.data.transaction_id
      };

      if (result.action === 'captured') {
        await cartServiceTx.authorizePayment(result.data.resource_id, context);
        await orderServiceTx.createFromCart(result.data.resource_id);
      } else if (result.action === 'failed') {
        await cartServiceTx.authorizePayment(result.data.resource_id, context);
      }
    });
  }
};
