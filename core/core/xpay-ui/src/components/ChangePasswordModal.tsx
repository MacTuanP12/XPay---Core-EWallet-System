import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, X, KeyRound, CheckCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import { userService } from '../api/services';
import Input from './Input';
import { clsx } from 'clsx';

interface Props {
    open: boolean;
    onClose: () => void;
}

interface FormState {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
interface FormErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
}

function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-400'];
    const labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
    return (
        <div className="mt-1.5 space-y-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all',
                        i <= score ? colors[score] : 'bg-gray-200')} />
                ))}
            </div>
            <p className="text-xs text-gray-400">
                Độ mạnh: <span className={clsx('font-medium',
                    score <= 1 ? 'text-red-500' : score <= 2 ? 'text-amber-500' : score <= 3 ? 'text-blue-500' : 'text-green-500')}>
                    {labels[score] || ''}
                </span>
            </p>
        </div>
    );
}

export default function ChangePasswordModal({ open, onClose }: Props) {
    const [form, setForm] = useState<FormState>({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset khi mở lại
    useEffect(() => {
        if (open) {
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
            setSuccess(false);
            setShow({ current: false, new: false, confirm: false });
        }
    }, [open]);

    const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        if (!form.newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới';
        else if (form.newPassword.length < 8) e.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
        else if (form.newPassword === form.currentPassword) e.newPassword = 'Mật khẩu mới không được trùng mật khẩu hiện tại';
        if (!form.confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        try {
            await userService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });
            setSuccess(true);
        } catch (err) {
            const axErr = err as AxiosError<{ message?: string }>;
            setErrors({ general: axErr.response?.data?.message ?? 'Đổi mật khẩu thất bại, vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                            <KeyRound className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Đổi mật khẩu</h2>
                            <p className="text-xs text-gray-400">Cập nhật mật khẩu tài khoản của bạn</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {success ? (
                        // Success state
                        <div className="flex flex-col items-center text-center py-4 gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-base">Đổi mật khẩu thành công!</p>
                                <p className="text-sm text-gray-500 mt-1">Mật khẩu của bạn đã được cập nhật.</p>
                            </div>
                            <button onClick={onClose}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all mt-2">
                                Đóng
                            </button>
                        </div>
                    ) : (
                        // Form state
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {errors.general && (
                                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                    <span className="shrink-0">⚠️</span>
                                    <span>{errors.general}</span>
                                </div>
                            )}

                            <Input
                                label="Mật khẩu hiện tại"
                                type={show.current ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu hiện tại..."
                                value={form.currentPassword}
                                onChange={set('currentPassword')}
                                error={errors.currentPassword}
                                autoComplete="current-password"
                                leftIcon={<Lock className="w-4 h-4" />}
                                rightIcon={
                                    <button type="button" tabIndex={-1}
                                        onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                                        className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />

                            <div>
                                <Input
                                    label="Mật khẩu mới"
                                    type={show.new ? 'text' : 'password'}
                                    placeholder="Ít nhất 8 ký tự..."
                                    value={form.newPassword}
                                    onChange={set('newPassword')}
                                    error={errors.newPassword}
                                    autoComplete="new-password"
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <button type="button" tabIndex={-1}
                                            onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                                            className="text-gray-400 hover:text-gray-600 transition-colors">
                                            {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                />
                                <PasswordStrength password={form.newPassword} />
                            </div>

                            <Input
                                label="Xác nhận mật khẩu mới"
                                type={show.confirm ? 'text' : 'password'}
                                placeholder="Nhập lại mật khẩu mới..."
                                value={form.confirmPassword}
                                onChange={set('confirmPassword')}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                                leftIcon={<Lock className="w-4 h-4" />}
                                rightIcon={
                                    <button type="button" tabIndex={-1}
                                        onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                                        className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />

                            {/* Checklist */}
                            {form.newPassword && (
                                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                                    {[
                                        { ok: form.newPassword.length >= 8,              label: 'Ít nhất 8 ký tự' },
                                        { ok: /[A-Z]/.test(form.newPassword),            label: 'Có chữ hoa (A-Z)' },
                                        { ok: /[0-9]/.test(form.newPassword),            label: 'Có chữ số (0-9)' },
                                        { ok: /[^A-Za-z0-9]/.test(form.newPassword),    label: 'Có ký tự đặc biệt' },
                                    ].map(({ ok, label }) => (
                                        <div key={label} className={clsx('flex items-center gap-2 text-xs',
                                            ok ? 'text-green-600' : 'text-gray-400')}>
                                            <span>{ok ? '✓' : '○'}</span>
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                                    Huỷ
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                                    {loading ? (
                                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>Đang xử lý...</>
                                    ) : 'Đổi mật khẩu'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

