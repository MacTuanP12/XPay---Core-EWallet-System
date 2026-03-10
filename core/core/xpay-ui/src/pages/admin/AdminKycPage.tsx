import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ShieldX, RefreshCw, UserCheck } from 'lucide-react';
import { adminService } from '../../api/services';
import type { AdminUser, PageResponse } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { clsx } from 'clsx';

const PAGE_SIZE = 20;

export default function AdminKycPage() {
    const { toasts, toast, removeToast } = useToast();
    const [data,     setData]     = useState<PageResponse<AdminUser> | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchPage = useCallback(async () => {
        setLoading(true);
        try {
            // lấy tất cả user, filter UNVERIFIED ở client
            const res = await adminService.getUsers(0, PAGE_SIZE);
            setData(res.data.data);
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPage(); }, [fetchPage]);

    const handleApprove = async (user: AdminUser) => {
        setActionId(user.userId + '_approve');
        try {
            const res = await adminService.approveKyc(user.userId);
            toast.success('KYC đã duyệt', `@${res.data.data.username} được xác minh thành công`);
            updateUser(res.data.data);
        } catch { toast.error('Duyệt KYC thất bại', 'Vui lòng thử lại'); }
        finally { setActionId(null); }
    };

    const handleReject = async (user: AdminUser) => {
        setActionId(user.userId + '_reject');
        try {
            const res = await adminService.rejectKyc(user.userId);
            toast.warning('KYC bị từ chối', `@${res.data.data.username} đã bị từ chối KYC`);
            updateUser(res.data.data);
        } catch { toast.error('Từ chối KYC thất bại', 'Vui lòng thử lại'); }
        finally { setActionId(null); }
    };

    const updateUser = (updated: AdminUser) => {
        setData(prev => prev ? {
            ...prev,
            content: prev.content.map(u => u.userId === updated.userId ? updated : u),
        } : prev);
    };

    const allUsers  = data?.content ?? [];
    const pending   = allUsers.filter(u => u.kycStatus === 'UNVERIFIED');
    const processed = allUsers.filter(u => u.kycStatus !== 'UNVERIFIED');

    return (
        <AdminLayout>
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <div className="p-8 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Phê duyệt KYC</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            <span className="font-semibold text-amber-600">{pending.length}</span> người dùng đang chờ xác minh
                        </p>
                    </div>
                    <button onClick={fetchPage}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 bg-white transition-all">
                        <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
                        Làm mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Pending */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <h2 className="font-semibold text-gray-800">Chờ duyệt ({pending.length})</h2>
                            </div>
                            {pending.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                                    <UserCheck className="w-10 h-10 opacity-30" />
                                    <p className="text-sm">Không có yêu cầu KYC nào đang chờ</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {pending.map(user => (
                                        <div key={user.userId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 uppercase shrink-0">
                                                    {user.username[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.username}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                                <div className="hidden sm:block text-xs text-gray-400 ml-4">
                                                    Số dư: <span className="font-medium text-gray-600">{user.walletBalance}</span>
                                                </div>
                                                <div className="hidden sm:block text-xs text-gray-400">
                                                    Đăng ký: <span className="font-medium text-gray-600">{user.createdAt}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(user)}
                                                    disabled={!!actionId}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50"
                                                >
                                                    {actionId === user.userId + '_approve' ? (
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                                    ) : <ShieldCheck className="w-4 h-4" />}
                                                    Phê duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleReject(user)}
                                                    disabled={!!actionId}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all disabled:opacity-50"
                                                >
                                                    {actionId === user.userId + '_reject' ? (
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                                    ) : <ShieldX className="w-4 h-4" />}
                                                    Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Processed */}
                        {processed.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                    <h2 className="font-semibold text-gray-800">Đã xử lý ({processed.length})</h2>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {processed.map(user => (
                                        <div key={user.userId} className="px-6 py-3.5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase shrink-0">
                                                    {user.username[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">{user.username}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold',
                                                user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                                                {user.kycStatus === 'VERIFIED' ? '✓ Đã duyệt' : '✕ Từ chối'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

