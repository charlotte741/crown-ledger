/* eslint-disable react-refresh/only-export-components */
import { Homelayout } from "../components";
import Homepage from "../pages/Homepage";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import SignUp from "../pages/Auth/Signup";
import Login from "../pages/Auth/Login";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import DashboardLayout from "../components/layout/DashboardLayout";
import Transactions from "../pages/Dashboard/Transaction";
import Cards from "../pages/Dashboard/Cards";
import Investments from "../pages/Dashboard/Investment";
import Settings from "../pages/Dashboard/Settings";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/Verifyemail";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminWallets from "../pages/Admin/AdminWallets";

const hasSession = () =>
    typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));

const isAdmin = () => {
    if (typeof window === "undefined") return false;
    try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        return user?.isAdmin === true;
    } catch {
        return false;
    }
};

function RequireAuth() {
    return hasSession() ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnly() {
    return hasSession() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function RequireAdmin() {
    if (!hasSession()) return <Navigate to="/login" replace />;
    return isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export const Router = createBrowserRouter([
    {
        element: <PublicOnly />,
        children: [
            {
                path: "/",
                element: <Homelayout />,
                children: [{ index: true, element: <Homepage /> }],
            },
            { path: "/open-Account", element: <SignUp /> },
            { path: "/login", element: <Login /> },
            { path: "/forgotpassword", element: <ForgotPassword /> },
            { path: "/reset-password", element: <ResetPassword /> },
            { path: "/verify-email", element: <VerifyEmail /> },
        ],
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardLayout />,
                children: [
                    { index: true, element: <DashboardHome /> },
                    { path: "/dashboard/transactions", element: <Transactions /> },
                    { path: "/dashboard/savings", element: <Cards /> },
                    { path: "/dashboard/investments", element: <Investments /> },
                    { path: "/dashboard/settings", element: <Settings /> },
                ],
            },
            {
                element: <RequireAdmin />,
                children: [
                    {
                        path: "/admin",
                        element: <DashboardLayout />,
                        children: [
                            { index: true, element: <AdminUsers /> },
                            {path: "/admin/wallets", element: <AdminWallets />}
                        ],
                    },
                ],
            },
        ],
    },
]);
