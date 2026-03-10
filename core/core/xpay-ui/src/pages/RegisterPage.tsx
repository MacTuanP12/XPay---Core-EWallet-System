import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Wallet, CheckCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import { authService } from '../api/services';
import Input from '../components/Input';

interface FormData { username: string; email: string; password: string; confirmPassword: string; }
interface FormErrors { username?: string; email?: string; password?: string; confirmPassword?: string; general?: string; }

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormData>({ username: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.username.trim())        e.username = 'Vui lòng nhập tên đăng nhập';
        else if (form.username.length < 4) e.username = 'Username phải từ 4 ký tự trở lên';
        if (!form.email.trim())           e.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không đúng định dạng';
        if (!form.password)               e.password = 'Vui lòng nhập mật khẩu';
        else if (form.password.length < 8) e.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        if (!form.confirmPassword)        e.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        try {
            await authService.register({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            setSuccess(true);
        } catch (err) {
            const axErr = err as AxiosError<{ message?: string }>;
            setErrors({ general: axErr.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.' });
        } finally { setLoading(false); }
    };

    // ── Success screen ──────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-5">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Đăng ký thành công!</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Tài khoản <span className="font-semibold text-indigo-600">@{form.username}</span> đã được tạo.<br />
                            Ví điện tử của bạn đã sẵn sàng.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Register form ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">XPay</h1>
                    <p className="text-gray-500 mt-1 text-sm">Ví điện tử thông minh</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Tạo tài khoản</h2>
                        <p className="text-sm text-gray-500 mt-1">Đăng ký để bắt đầu sử dụng XPay</p>
                    </div>

                    {errors.general && (
                        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                            <span className="mt-0.5">&#10060;</span>
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <Input label="Tên đăng nhập" type="text" placeholder="Ít nhất 4 ký tự..."
                            value={form.username} onChange={set('username')} error={errors.username}
                            autoComplete="username" autoFocus leftIcon={<User className="w-4 h-4" />} />

                        <Input label="Email" type="email" placeholder="example@email.com"
                            value={form.email} onChange={set('email')} error={errors.email}
                            autoComplete="email" leftIcon={<Mail className="w-4 h-4" />} />

                        <Input label="Mật khẩu" type={showPw ? 'text' : 'password'}
                            placeholder="Ít nhất 8 ký tự..."
                            value={form.password} onChange={set('password')} error={errors.password}
                            autoComplete="new-password" leftIcon={<Lock className="w-4 h-4" />}
                            rightIcon={
                                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            } />

                        <Input label="Xác nhận mật khẩu" type={showConfirm ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu..."
                            value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword}
                            autoComplete="new-password" leftIcon={<Lock className="w-4 h-4" />}
                            rightIcon={
                                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            } />

                        {/* Password strength indicator */}
                        {form.password && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {[1,2,3,4].map(i => {
                                        const strength = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)];
                                        const filled = strength.filter(Boolean).length;
                                        return <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= filled ? (filled <= 1 ? 'bg-red-400' : filled <= 2 ? 'bg-amber-400' : filled <= 3 ? 'bg-blue-400' : 'bg-green-400') : 'bg-gray-200'}`} />;
                                    })}
                                </div>
                                <p className="text-xs text-gray-400">Độ mạnh mật khẩu tốt hơn khi có: chữ hoa, số, ký tự đặc biệt</p>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2">
                            {loading ? (
                                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Đang tạo tài khoản...</>
                            ) : 'Tạo tài khoản'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                            Đăng nhập
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

