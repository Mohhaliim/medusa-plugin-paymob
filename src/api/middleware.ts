import { MiddlewaresConfig } from "@medusajs/medusa"
import { raw } from "body-parser"

export const config: MiddlewaresConfig = {
  routes: [
    {
      method: ["POST", "PUT"],
      matcher: "/webhooks/*",
      bodyParser: false,
      middlewares: [raw({ type: "application/json" })],
    },
  ],
}