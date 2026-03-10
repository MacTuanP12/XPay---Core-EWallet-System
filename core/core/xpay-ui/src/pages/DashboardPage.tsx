import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, PlusCircle, RefreshCw, ShieldCheck, ShieldAlert, Clock, KeyRound } from 'lucide-react';
import { walletService, userService } from '../api/services';
import type { WalletResponse, UserProfile } from '../types';
import AppLayout from '../components/AppLayout';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { clsx } from 'clsx';

const KYC_CONFIG = {
    VERIFIED:   { label: 'Đã xác minh',  icon: ShieldCheck, cls: 'bg-green-100 text-green-700' },
    UNVERIFIED: { label: 'Chờ xác minh', icon: Clock,       cls: 'bg-amber-100 text-amber-700' },
    REJECTED:   { label: 'Bị từ chối',   icon: ShieldAlert, cls: 'bg-red-100 text-red-700'     },
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const [wallet,  setWallet]  = useState<WalletResponse | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showChangePw, setShowChangePw] = useState(false);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const [w, p] = await Promise.all([
                walletService.getMyWallet(),
                userService.getProfile(),
            ]);
            setWallet(w.data.data);
            setProfile(p.data.data);
        } catch {
            // handled by axios interceptor
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const kycCfg = profile ? KYC_CONFIG[profile.kycStatus] : null;

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full min-h-screen">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Chào mừng trở lại, <span className="font-medium text-blue-600">{profile?.username}</span>!</p>
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
                        Làm mới
                    </button>
                </div>

                {/* Balance Card */}
                <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-300/40">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Số dư ví</p>
                            <p className="text-4xl font-bold mt-1 tracking-tight">{wallet?.balance ?? '—'}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-blue-200">Mã ví</p>
                            <p className="font-mono text-xs mt-0.5 text-blue-100">{wallet?.walletId ?? '—'}</p>
                        </div>
                        <span className={clsx(
                            'px-2.5 py-1 rounded-full text-xs font-semibold',
                            wallet?.status === 'ACTIVE' ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'
                        )}>
                            {wallet?.status === 'ACTIVE' ? '● Hoạt động' : '● Bị khoá'}
                        </span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Nạp tiền',    icon: PlusCircle,     to: '/deposit',      cls: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' },
                        { label: 'Chuyển tiền', icon: ArrowUpRight,   to: '/transfer',     cls: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'   },
                        { label: 'Lịch sử GD',  icon: ArrowDownLeft,  to: '/transactions', cls: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                    ].map(({ label, icon: Icon, to, cls }) => (
                        <button
                            key={to}
                            onClick={() => navigate(to)}
                            className={clsx('flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-150 font-medium text-sm', cls)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                                <Icon className="w-5 h-5" />
                            </div>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Profile Card */}
                {profile && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Thông tin tài khoản</h2>
                            <button
                                onClick={() => setShowChangePw(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
                            >
                                <KeyRound className="w-3.5 h-3.5" />
                                Đổi mật khẩu
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Tên đăng nhập</p>
                                <p className="text-sm font-semibold text-gray-800">{profile.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Email</p>
                                <p className="text-sm font-semibold text-gray-800">{profile.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Ngày tạo</p>
                                <p className="text-sm font-semibold text-gray-800">{profile.createdAt}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Trạng thái KYC</p>
                                {kycCfg && (
                                    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', kycCfg.cls)}>
                                        <kycCfg.icon className="w-3.5 h-3.5" />
                                        {kycCfg.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal đổi mật khẩu */}
            <ChangePasswordModal open={showChangePw} onClose={() => setShowChangePw(false)} />
        </AppLayout>
    );
}

