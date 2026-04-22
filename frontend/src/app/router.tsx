import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./layout/admin-layout";
import { ClientLayout } from "./layout/client-layout";
import { AdminAccountsPage } from "../features/admin/pages/admin-accounts-page";
import { AdminCategoriesPage } from "../features/admin/pages/admin-categories-page";
import { AdminDashboardPage } from "../features/admin/pages/admin-dashboard-page";
import { AdminLoginPage } from "../features/admin/pages/admin-login-page";
import { AdminMyAccountPage } from "../features/admin/pages/admin-my-account-page";
import { AdminProductsPage } from "../features/admin/pages/admin-products-page";
import { AdminRolesPage } from "../features/admin/pages/admin-roles-page";
import { AdminSettingsPage } from "../features/admin/pages/admin-settings-page";
import { ForgotPasswordPage } from "../features/auth/pages/forgot-password-page";
import { LoginPage } from "../features/auth/pages/login-page";
import { OtpPage } from "../features/auth/pages/otp-page";
import { RegisterPage } from "../features/auth/pages/register-page";
import { ResetPasswordPage } from "../features/auth/pages/reset-password-page";
import { CartPage } from "../features/cart/pages/cart-page";
import { CheckoutPage } from "../features/checkout/pages/checkout-page";
import { CheckoutSuccessPage } from "../features/checkout/pages/checkout-success-page";
import { HealthPage } from "../features/health/pages/health-page";
import { ProductDetailPage } from "../features/products/pages/product-detail-page";
import { ProductsPage } from "../features/products/pages/products-page";
import { ChangePasswordPage } from "../features/user/pages/change-password-page";
import { UserAddressPage } from "../features/user/pages/user-address-page";
import { UserProfilePage } from "../features/user/pages/user-profile-page";
import { UserPurchasePage } from "../features/user/pages/user-purchase-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "checkout/success/:orderId", element: <CheckoutSuccessPage /> },
      { path: "auth/register", element: <RegisterPage /> },
      { path: "auth/login", element: <LoginPage /> },
      { path: "auth/forgot", element: <ForgotPasswordPage /> },
      { path: "auth/otp", element: <OtpPage /> },
      { path: "auth/reset", element: <ResetPasswordPage /> },
      { path: "user/profile", element: <UserProfilePage /> },
      { path: "user/address", element: <UserAddressPage /> },
      { path: "user/purchase", element: <UserPurchasePage /> },
      { path: "user/change-password", element: <ChangePasswordPage /> },
      { path: "health", element: <HealthPage /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "categories", element: <AdminCategoriesPage /> },
      { path: "roles", element: <AdminRolesPage /> },
      { path: "accounts", element: <AdminAccountsPage /> },
      { path: "my-account", element: <AdminMyAccountPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ],
  },
]);
