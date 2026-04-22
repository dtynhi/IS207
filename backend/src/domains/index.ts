import { Router } from "express";
import authRoutes from "./auth/interfaces/http/auth.routes";
import productRoutes from "./product/interfaces/http/product.routes";
import categoryRoutes from "./category/interfaces/http/category.routes";
import cartRoutes from "./cart/interfaces/http/cart.routes";
import orderRoutes from "./order/interfaces/http/order.routes";
import userRoutes from "./user/interfaces/http/user.routes";
import accountRoutes from "./account/interfaces/http/account.routes";
import roleRoutes from "./role/interfaces/http/role.routes";
import settingRoutes from "./setting/interfaces/http/setting.routes";
import dashboardRoutes from "./dashboard/interfaces/http/dashboard.routes";

const domainRouter = Router();

domainRouter.use(authRoutes);
domainRouter.use(productRoutes);
domainRouter.use(categoryRoutes);
domainRouter.use(cartRoutes);
domainRouter.use(orderRoutes);
domainRouter.use(userRoutes);
domainRouter.use(accountRoutes);
domainRouter.use(roleRoutes);
domainRouter.use(settingRoutes);
domainRouter.use(dashboardRoutes);

export default domainRouter;
