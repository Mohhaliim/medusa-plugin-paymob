export { default as PaymobPaymentService } from "./services/paymob-payment";
export { default as PaymentProviderServiceExtension } from "./services/payment_provider";

// Export the plugin configuration
export default {
  // Plugin services
  services: ["./services/paymob-payment", "./services/payment_provider"],
  // Plugin API routes
  api: ["./api"],
  // Plugin subscribers
  subscribers: ["./subscribers/order-capture-handler"],
};
