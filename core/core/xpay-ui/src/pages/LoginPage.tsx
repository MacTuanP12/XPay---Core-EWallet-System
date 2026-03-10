import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Wallet } from 'lucide-react';
import type { AxiosError } from 'axios';
import { authService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import type { AuthResponse } from '../types';

interface FormErrors {
    username?: string;
    password?: string;
    general?: string;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const res = await authService.login({ username: username.trim(), password });
            const data: AuthResponse = res.data;
            login(data);
            // Redirect theo role
            navigate(data.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard');
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            const msg =
                axiosErr.response?.data?.message ||
                'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            setErrors({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">XPay</h1>
                    <p className="text-gray-500 mt-1 text-sm">Ví điện tử thông minh</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Đăng nhập</h2>
                        <p className="text-sm text-gray-500 mt-1">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
                    </div>

                    {/* General error */}
                    {errors.general && (
                        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                            <span className="mt-0.5 text-red-500">&#10060;</span>
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <Input
                            label="Tên đăng nhập"
                            type="text"
                            placeholder="Nhập tên đăng nhập..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            error={errors.username}
                            autoComplete="username"
                            autoFocus
                            leftIcon={<User className="w-4 h-4" />}
                        />

                        <Input
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            autoComplete="current-password"
                            leftIcon={<Lock className="w-4 h-4" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 rounded accent-indigo-600" />
                                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; {new Date().getFullYear()} XPay. Bảo mật & An toàn.
                </p>
            </div>
        </div>
    );
}

