"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderServiceExtension = exports.PaymobPaymentService = void 0;
var paymob_payment_1 = require("./services/paymob-payment");
Object.defineProperty(exports, "PaymobPaymentService", { enumerable: true, get: function () { return __importDefault(paymob_payment_1).default; } });
var payment_provider_1 = require("./services/payment_provider");
Object.defineProperty(exports, "PaymentProviderServiceExtension", { enumerable: true, get: function () { return __importDefault(payment_provider_1).default; } });
// Export the plugin configuration
exports.default = {
    // Plugin services
    services: [
        './services/paymob-payment',
        './services/payment_provider'
    ],
    // Plugin API routes
    api: [
        './api'
    ],
    // Plugin subscribers
    subscribers: [
        './subscribers/order-capture-handler'
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNERBQTRFO0FBQW5FLHVJQUFBLE9BQU8sT0FBd0I7QUFDeEMsZ0VBQXlGO0FBQWhGLG9KQUFBLE9BQU8sT0FBbUM7QUFFbkQsa0NBQWtDO0FBQ2xDLGtCQUFlO0lBQ2Isa0JBQWtCO0lBQ2xCLFFBQVEsRUFBRTtRQUNSLDJCQUEyQjtRQUMzQiw2QkFBNkI7S0FDOUI7SUFDRCxvQkFBb0I7SUFDcEIsR0FBRyxFQUFFO1FBQ0gsT0FBTztLQUNSO0lBQ0QscUJBQXFCO0lBQ3JCLFdBQVcsRUFBRTtRQUNYLHFDQUFxQztLQUN0QztDQUNGLENBQUMifQ==