import { createBrowserRouter } from "react-router-dom";
import Login from "./components/auth/Login";
import Welcome from "./components/pages/Welcome";
import Unauthorized from "./components/auth/Unauthorized";
import Forgot from "./components/auth/Forgot";
import ResetPassword from "./components/auth/ResetPassword";
import MainLayout from "./components/layouts/MainLayout";
import ErrorPage from "./components/pages/ErrorPage";
import Register from "./components/auth/Register";
import CustomerDisplay from "./components/customer/CustomerDisplay";
import Dashboard from "./components/dashboard/Dashboard";
import { superAdminRoutes } from "./routes/superAdminRoutes";
import { SUPER_ADMIN_BASE, LOGIN, ROOT, UNAUTHORIZED, FORGOT, RESET_PASSWORD, REGISTER } from "./routes/commonRoutes";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  { path: LOGIN, element: <Login /> },
  { path: REGISTER, element: <Register /> },
  { path: ROOT, element: <Welcome /> },
  { path: UNAUTHORIZED, element: <Unauthorized /> },
  { path: FORGOT, element: <Forgot /> },
  { path: RESET_PASSWORD, element: <ResetPassword /> },

  // Public Customer Display System (CDS) — no login required
  { path: "/customer-display", element: <CustomerDisplay /> },

  // SUPER ADMIN ROUTES
  {
    path: "/",
    element: (
      <MainLayout />
    ),
    errorElement: <ErrorPage />,
    children: superAdminRoutes,
  }
]);

export default router;
