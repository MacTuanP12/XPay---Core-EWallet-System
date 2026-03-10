import { useEffect, useState, useCallback } from 'react';
import { Search, Lock, Unlock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../api/services';
import type { AdminUser, PageResponse } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { clsx } from 'clsx';

const KYC_BADGE: Record<string, string> = {
    VERIFIED:   'bg-green-100 text-green-700',
    UNVERIFIED: 'bg-amber-100 text-amber-700',
    REJECTED:   'bg-red-100 text-red-700',
};
const KYC_LABEL: Record<string, string> = {
    VERIFIED: 'Đã xác minh', UNVERIFIED: 'Chưa xác minh', REJECTED: 'Từ chối',
};

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
    const { toasts, toast, removeToast } = useToast();
    const [data,     setData]     = useState<PageResponse<AdminUser> | null>(null);
    const [page,     setPage]     = useState(0);
    const [loading,  setLoading]  = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [search,   setSearch]   = useState('');

    const fetchPage = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await adminService.getUsers(p, PAGE_SIZE);
            setData(res.data.data);
            setPage(p);
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    const handleToggleLock = async (user: AdminUser) => {
        setActionId(user.userId);
        try {
            const res = await adminService.toggleWalletLock(user.userId);
            const updated = res.data.data;
            const isNowLocked = updated.walletStatus === 'LOCKED';
            toast.success(
                isNowLocked ? 'Đã khoá ví' : 'Đã mở khoá ví',
                `Ví của @${updated.username} ${isNowLocked ? 'bị khoá' : 'đã mở lại'}`
            );
            // cập nhật dữ liệu local
            setData(prev => prev ? {
                ...prev,
                content: prev.content.map(u => u.userId === user.userId ? updated : u),
            } : prev);
        } catch {
            toast.error('Thao tác thất bại', 'Vui lòng thử lại');
        } finally { setActionId(null); }
    };

    const users = data?.content ?? [];
    const filtered = search.trim()
        ? users.filter(u =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
        : users;
    const totalPages = data?.totalPages ?? 1;

    return (
        <AdminLayout>
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {data ? `Tổng ${data.totalElements} người dùng` : ''}
                        </p>
                    </div>
                    <button onClick={() => fetchPage(page)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 bg-white transition-all">
                        <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
                        Làm mới
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm username hoặc email..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 text-sm">Không tìm thấy người dùng nào</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3.5 text-left">Người dùng</th>
                                    <th className="px-5 py-3.5 text-left">KYC</th>
                                    <th className="px-5 py-3.5 text-right">Số dư ví</th>
                                    <th className="px-5 py-3.5 text-center">Trạng thái ví</th>
                                    <th className="px-5 py-3.5 text-left">Ngày tạo</th>
                                    <th className="px-5 py-3.5 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(user => (
                                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 uppercase shrink-0">
                                                    {user.username[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.username}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold', KYC_BADGE[user.kycStatus] ?? 'bg-gray-100 text-gray-600')}>
                                                {KYC_LABEL[user.kycStatus] ?? user.kycStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-semibold text-gray-800">{user.walletBalance}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold',
                                                user.walletStatus === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700')}>
                                                {user.walletStatus === 'ACTIVE' ? '● Hoạt động' : '● Bị khoá'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">{user.createdAt}</td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleLock(user)}
                                                disabled={actionId === user.userId}
                                                className={clsx(
                                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                                    user.walletStatus === 'ACTIVE'
                                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
                                                    actionId === user.userId && 'opacity-50 cursor-not-allowed'
                                                )}
                                            >
                                                {actionId === user.userId ? (
                                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                                    </svg>
                                                ) : user.walletStatus === 'ACTIVE' ? (
                                                    <><Lock className="w-3 h-3" /> Khoá ví</>
                                                ) : (
                                                    <><Unlock className="w-3 h-3" /> Mở khoá</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => fetchPage(page - 1)} disabled={page === 0}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all bg-white">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i).map(i => (
                                <button key={i} onClick={() => fetchPage(i)}
                                    className={clsx('w-9 h-9 rounded-lg text-sm font-medium transition-all border',
                                        i === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100 bg-white')}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all bg-white">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

