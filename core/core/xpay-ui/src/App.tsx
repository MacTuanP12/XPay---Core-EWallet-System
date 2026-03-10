import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// User pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import TransferPage from './pages/TransferPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';

// Admin pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminKycPage from './pages/admin/AdminKycPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login"           element={<LoginPage />} />
                    <Route path="/register"        element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* User routes */}
                    <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/deposit"      element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
                    <Route path="/transfer"     element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />

                    {/* Admin routes */}
                    <Route path="/admin"              element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
                    <Route path="/admin/users"        element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                    <Route path="/admin/kyc"          element={<AdminRoute><AdminKycPage /></AdminRoute>} />
                    <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
