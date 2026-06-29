import { router } from "./context.js";
import { authRouter } from "./routers/auth.js";
import { farmerRouter, companyRouter, supplierRouter } from "./routers/profile.js";
import { adminRouter } from "./routers/admin.js";
import { uploadRouter } from "./routers/upload.js";
import { productRouter } from "./routers/product.js";
import { rfqRouter } from "./routers/rfq.js";
import { orderRouter } from "./routers/order.js";
import { chatRouter } from "./routers/chat.js";
import { reviewRouter, favoriteRouter } from "./routers/review.js";
import { contentRouter } from "./routers/content.js";
import { networkRouter, adRouter, inquiryRouter, rankingRouter } from "./routers/social.js";
import { aiRouter } from "./routers/ai.js";
import { shipmentRouter, webhookRouter, apiKeyRouter } from "./routers/logistics.js";

export const appRouter = router({
  auth: authRouter,
  farmer: farmerRouter,
  company: companyRouter,
  supplier: supplierRouter,
  admin: adminRouter,
  upload: uploadRouter,
  product: productRouter,
  rfq: rfqRouter,
  order: orderRouter,
  chat: chatRouter,
  review: reviewRouter,
  favorite: favoriteRouter,
  content: contentRouter,
  network: networkRouter,
  ad: adRouter,
  inquiry: inquiryRouter,
  ranking: rankingRouter,
  ai: aiRouter,
  shipment: shipmentRouter,
  webhook: webhookRouter,
  apiKey: apiKeyRouter,
});

export type AppRouter = typeof appRouter;
