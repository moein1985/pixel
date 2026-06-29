import { router } from "./context.js";
import { authRouter } from "./routers/auth.js";
import { farmerRouter, companyRouter, supplierRouter } from "./routers/profile.js";

export const appRouter = router({
  auth: authRouter,
  farmer: farmerRouter,
  company: companyRouter,
  supplier: supplierRouter,
});

export type AppRouter = typeof appRouter;
