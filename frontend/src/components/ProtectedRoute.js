import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';

    // Nếu đã xác thực, render component con (AdminDashboard)
    // Nếu không, chuyển hướng đến trang đăng nhập
    return isAuthenticated ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default ProtectedRoute; 