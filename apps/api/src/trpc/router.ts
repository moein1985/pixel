import { router } from "./context.js";
import { authRouter } from "./routers/auth.js";
import { farmerRouter, companyRouter, supplierRouter } from "./routers/profile.js";
import { adminRouter } from "./routers/admin.js";
import { uploadRouter } from "./routers/upload.js";

export const appRouter = router({
  auth: authRouter,
  farmer: farmerRouter,
  company: companyRouter,
  supplier: supplierRouter,
  admin: adminRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
