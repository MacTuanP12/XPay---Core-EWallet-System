import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Wallet, KeyRound, CheckCircle, Copy } from 'lucide-react';
import type { AxiosError } from 'axios';
import { authService } from '../api/services';
import Input from '../components/Input';

type Step = 'request' | 'reset' | 'done';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep]           = useState<Step>('request');

    // Step 1
    const [email, setEmail]         = useState('');
    const [emailErr, setEmailErr]   = useState('');
    const [loadingReq, setLoadingReq] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [copied, setCopied]       = useState(false);

    // Step 2
    const [token, setToken]         = useState('');
    const [newPw, setNewPw]         = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw]       = useState(false);
    const [resetErr, setResetErr]   = useState<Record<string, string>>({});
    const [loadingReset, setLoadingReset] = useState(false);

    // ── Step 1: request token ──────────────────────────────────────────────
    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setEmailErr('Vui lòng nhập email'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr('Email không đúng định dạng'); return; }
        setEmailErr('');
        setLoadingReq(true);
        try {
            const res = await authService.forgotPassword(email.trim());
            setResetToken(res.data.resetToken);
            setStep('reset');
        } catch (err) {
            const axErr = err as AxiosError<{ message?: string }>;
            setEmailErr(axErr.response?.data?.message ?? 'Không tìm thấy tài khoản với email này');
        } finally { setLoadingReq(false); }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(resetToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Step 2: reset password ─────────────────────────────────────────────
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!token.trim())   errs.token     = 'Vui lòng nhập token';
        if (!newPw)          errs.newPw     = 'Vui lòng nhập mật khẩu mới';
        else if (newPw.length < 8) errs.newPw = 'Mật khẩu phải có ít nhất 8 ký tự';
        if (!confirmPw)      errs.confirmPw = 'Vui lòng xác nhận mật khẩu';
        else if (newPw !== confirmPw) errs.confirmPw = 'Mật khẩu xác nhận không khớp';
        setResetErr(errs);
        if (Object.keys(errs).length > 0) return;

        setLoadingReset(true);
        try {
            await authService.resetPassword({ token: token.trim(), newPassword: newPw, confirmPassword: confirmPw });
            setStep('done');
        } catch (err) {
            const axErr = err as AxiosError<{ message?: string }>;
            setResetErr({ general: axErr.response?.data?.message ?? 'Token không hợp lệ hoặc đã hết hạn' });
        } finally { setLoadingReset(false); }
    };

    // ── Shared wrapper ─────────────────────────────────────────────────────
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">XPay</h1>
                    <p className="text-gray-500 mt-1 text-sm">Ví điện tử thông minh</p>
                </div>
                {children}
                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; {new Date().getFullYear()} XPay. Bảo mật & An toàn.
                </p>
            </div>
        </div>
    );

    // ── Step 1 UI ──────────────────────────────────────────────────────────
    if (step === 'request') return (
        <Wrapper>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl mb-5">
                    <KeyRound className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Quên mật khẩu?</h2>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                    Nhập email đã đăng ký. Hệ thống sẽ cấp token để đặt lại mật khẩu.
                </p>

                <form onSubmit={handleRequest} noValidate className="space-y-4">
                    <Input label="Email đã đăng ký" type="email" placeholder="example@email.com"
                        value={email} onChange={e => setEmail(e.target.value)} error={emailErr}
                        autoFocus leftIcon={<Mail className="w-4 h-4" />} />

                    <button type="submit" disabled={loadingReq}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                        {loadingReq ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Đang xử lý...</>
                        ) : 'Gửi yêu cầu'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                        ← Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </Wrapper>
    );

    // ── Step 2 UI ──────────────────────────────────────────────────────────
    if (step === 'reset') return (
        <Wrapper>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Đặt lại mật khẩu</h2>
                    <p className="text-sm text-gray-500 mt-1">Dùng token bên dưới để đặt lại mật khẩu</p>
                </div>

                {/* Token display — demo mode */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">
                        🔑 Reset Token (Demo)
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 font-mono text-amber-800 break-all">
                            {resetToken}
                        </code>
                        <button onClick={handleCopy} title="Copy token"
                            className="shrink-0 p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-all">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    {copied && <p className="text-xs text-green-600 mt-1">✓ Đã copy!</p>}
                    <p className="text-xs text-amber-600 mt-2">⏱ Token có hiệu lực trong 15 phút</p>
                </div>

                {resetErr.general && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        <span>&#10060;</span><span>{resetErr.general}</span>
                    </div>
                )}

                <form onSubmit={handleReset} noValidate className="space-y-4">
                    <Input label="Token xác nhận" type="text" placeholder="Dán token vào đây..."
                        value={token} onChange={e => setToken(e.target.value)} error={resetErr.token}
                        leftIcon={<KeyRound className="w-4 h-4" />} />

                    <Input label="Mật khẩu mới" type={showPw ? 'text' : 'password'}
                        placeholder="Ít nhất 8 ký tự..."
                        value={newPw} onChange={e => setNewPw(e.target.value)} error={resetErr.newPw}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                            <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                                className="text-gray-400 hover:text-gray-600 transition-colors">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        } />

                    <Input label="Xác nhận mật khẩu mới" type="password"
                        placeholder="Nhập lại mật khẩu..."
                        value={confirmPw} onChange={e => setConfirmPw(e.target.value)} error={resetErr.confirmPw}
                        leftIcon={<Lock className="w-4 h-4" />} />

                    <button type="submit" disabled={loadingReset}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                        {loadingReset ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Đang xử lý...</>
                        ) : 'Đặt lại mật khẩu'}
                    </button>
                </form>
            </div>
        </Wrapper>
    );

    // ── Done UI ────────────────────────────────────────────────────────────
    return (
        <Wrapper>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Đặt lại thành công!</h2>
                <p className="text-gray-500 mt-2 text-sm">
                    Mật khẩu của bạn đã được cập nhật.<br />Vui lòng đăng nhập lại với mật khẩu mới.
                </p>
                <button onClick={() => navigate('/login')}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md">
                    Đăng nhập ngay
                </button>
            </div>
        </Wrapper>
    );
}

