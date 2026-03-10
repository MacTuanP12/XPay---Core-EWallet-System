import { useEffect, useState, useCallback } from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../api/services';
import type { AdminTransaction, PageResponse } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import { clsx } from 'clsx';

const TYPE_CFG = {
    DEPOSIT:  { label: 'Nạp tiền',    amtCls: 'text-green-600',  badgeCls: 'bg-green-100 text-green-700',   icon: ArrowDownLeft, sign: '+' },
    TRANSFER: { label: 'Chuyển tiền', amtCls: 'text-red-600',    badgeCls: 'bg-red-100 text-red-700',      icon: ArrowUpRight,  sign: '-' },
    WITHDRAW: { label: 'Rút tiền',    amtCls: 'text-orange-600', badgeCls: 'bg-orange-100 text-orange-700', icon: ArrowUpRight,  sign: '-' },
};
const STATUS_CFG   = { SUCCESS: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-700', PENDING: 'bg-amber-100 text-amber-700' };
const STATUS_LABEL = { SUCCESS: 'Thành công', FAILED: 'Thất bại', PENDING: 'Đang xử lý' };
const PAGE_SIZE = 20;

export default function AdminTransactionsPage() {
    const [data,    setData]    = useState<PageResponse<AdminTransaction> | null>(null);
    const [page,    setPage]    = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPage = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await adminService.getTransactions(p, PAGE_SIZE);
            setData(res.data.data);
            setPage(p);
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    const txs = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tra soát giao dịch</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{data ? `Tổng ${data.totalElements} giao dịch toàn hệ thống` : ''}</p>
                    </div>
                    <button onClick={() => fetchPage(page)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 bg-white transition-all">
                        <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} /> Làm mới
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : txs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                            <ArrowDownLeft className="w-12 h-12 opacity-20" />
                            <p className="text-sm">Chưa có giao dịch nào trong hệ thống</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3.5 text-left">Mã GD</th>
                                    <th className="px-5 py-3.5 text-left">Loại</th>
                                    <th className="px-5 py-3.5 text-left">Người gửi</th>
                                    <th className="px-5 py-3.5 text-left">Người nhận</th>
                                    <th className="px-5 py-3.5 text-left">Ghi chú</th>
                                    <th className="px-5 py-3.5 text-center">Trạng thái</th>
                                    <th className="px-5 py-3.5 text-left">Thời gian</th>
                                    <th className="px-5 py-3.5 text-right">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {txs.map(tx => {
                                    const tc   = TYPE_CFG[tx.type]     ?? TYPE_CFG.TRANSFER;
                                    const sc   = STATUS_CFG[tx.status] ?? STATUS_CFG.PENDING;
                                    const Icon = tc.icon;
                                    return (
                                        <tr key={tx.transactionId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs text-gray-400">{tx.transactionId.slice(0, 8)}…</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center', tx.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100')}>
                                                        <Icon className={clsx('w-3.5 h-3.5', tc.amtCls)} />
                                                    </div>
                                                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', tc.badgeCls)}>{tc.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-gray-700">{tx.senderUsername}</td>
                                            <td className="px-5 py-3.5 font-medium text-gray-700">{tx.receiverUsername}</td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs max-w-32 truncate">{tx.referenceNote || '—'}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold', sc)}>
                                                    {STATUS_LABEL[tx.status] ?? tx.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{tx.createdAt}</td>
                                            <td className={clsx('px-5 py-3.5 text-right font-bold', tc.amtCls)}>{tc.sign}{tx.amount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => fetchPage(page - 1)} disabled={page === 0}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i).map(i => (
                                <button key={i} onClick={() => fetchPage(i)}
                                    className={clsx('w-9 h-9 rounded-lg text-sm font-medium transition-all border',
                                        i === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100 bg-white')}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

