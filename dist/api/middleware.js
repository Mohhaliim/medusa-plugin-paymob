"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const body_parser_1 = require("body-parser");
exports.config = {
    routes: [
        {
            method: ["POST", "PUT"],
            matcher: "/webhooks/*",
            bodyParser: false,
            middlewares: [(0, body_parser_1.raw)({ type: "application/json" })],
        },
    ],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvbWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBaUM7QUFFcEIsUUFBQSxNQUFNLEdBQXNCO0lBQ3ZDLE1BQU0sRUFBRTtRQUNOO1lBQ0UsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztZQUN2QixPQUFPLEVBQUUsYUFBYTtZQUN0QixVQUFVLEVBQUUsS0FBSztZQUNqQixXQUFXLEVBQUUsQ0FBQyxJQUFBLGlCQUFHLEVBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1NBQ2pEO0tBQ0Y7Q0FDRixDQUFBIn0=