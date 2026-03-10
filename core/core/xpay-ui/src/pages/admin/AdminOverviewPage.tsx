import { useEffect, useState } from 'react';
import { Users, Wallet, ArrowLeftRight, TrendingUp, ShieldAlert, Lock, RefreshCw } from 'lucide-react';
import { adminService } from '../../api/services';
import type { AdminDashboardStats } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import { clsx } from 'clsx';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    sub?: string;
}

function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const res = await adminService.getStats();
            setStats(res.data.data);
        } catch { /* handled by interceptor */ }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { fetchStats(); }, []);

    return (
        <AdminLayout>
            <div className="p-8 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Thống kê toàn bộ hoạt động XPay</p>
                    </div>
                    <button onClick={() => fetchStats(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all bg-white">
                        <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
                        Làm mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : stats ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Tổng người dùng"    value={stats.totalUsers}         icon={Users}           color="bg-blue-500"   sub="Tài khoản đã đăng ký" />
                            <StatCard label="Tổng ví"             value={stats.totalWallets}       icon={Wallet}          color="bg-indigo-500" sub="Ví đang hoạt động" />
                            <StatCard label="Giao dịch hôm nay"  value={stats.todayTransactions}  icon={TrendingUp}      color="bg-green-500"  sub="Từ 00:00 đến hiện tại" />
                            <StatCard label="Tổng giao dịch"     value={stats.totalTransactions}  icon={ArrowLeftRight}  color="bg-purple-500" sub="Toàn bộ lịch sử" />
                        </div>

                        {/* Second row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Total balance — spans wider */}
                            <div className="lg:col-span-1 bg-linear-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
                                <p className="text-indigo-200 text-sm font-medium">Tổng số dư hệ thống</p>
                                <p className="text-3xl font-bold mt-2 tracking-tight">{stats.totalSystemBalance}</p>
                                <p className="text-indigo-300 text-xs mt-2">Tổng tất cả ví trong hệ thống</p>
                            </div>
                            <StatCard label="Chờ duyệt KYC"   value={stats.pendingKycCount} icon={ShieldAlert} color="bg-amber-500"  sub="User cần xét duyệt" />
                            <StatCard label="Ví bị khoá"       value={stats.lockedWallets}   icon={Lock}        color="bg-red-500"    sub="Cần xem xét" />
                        </div>

                        {/* Quick links */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Thao tác nhanh</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Xem danh sách User',    to: '/admin/users',        cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
                                    { label: `Duyệt KYC (${stats.pendingKycCount})`, to: '/admin/kyc', cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
                                    { label: 'Tra soát giao dịch',    to: '/admin/transactions', cls: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
                                ].map(({ label, to, cls }) => (
                                    <a key={to} href={to}
                                        className={clsx('flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-medium transition-all', cls)}>
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
}

