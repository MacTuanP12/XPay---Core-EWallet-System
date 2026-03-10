import { useEffect, useState, useCallback } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, RefreshCw, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { transactionService, walletService } from '../api/services';
import type { Transaction, PageResponse, DisplayType, WalletResponse } from '../types';
import AppLayout from '../components/AppLayout';
import { clsx } from 'clsx';

// ── Config theo displayType ────────────────────────────────────────────────
const DISPLAY_CFG: Record<DisplayType, {
    label: string;
    icon: React.ElementType;
    iconBg: string;
    amountCls: string;
    badgeCls: string;
}> = {
    DEPOSIT:  { label: 'Nạp tiền',    icon: ArrowDownLeft,  iconBg: 'bg-green-100',  amountCls: 'text-green-600',  badgeCls: 'bg-green-100 text-green-700'  },
    RECEIVED: { label: 'Nhận tiền',   icon: ArrowLeftRight, iconBg: 'bg-blue-100',   amountCls: 'text-blue-600',   badgeCls: 'bg-blue-100 text-blue-700'    },
    TRANSFER: { label: 'Chuyển tiền', icon: ArrowUpRight,   iconBg: 'bg-red-100',    amountCls: 'text-red-600',    badgeCls: 'bg-red-100 text-red-700'      },
};

const STATUS_CFG = {
    SUCCESS: { label: 'Thành công', cls: 'bg-green-100 text-green-700' },
    FAILED:  { label: 'Thất bại',   cls: 'bg-red-100 text-red-700'     },
    PENDING: { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-700' },
};

const PAGE_SIZE = 10;

export default function TransactionHistoryPage() {
    const [page,    setPage]    = useState(0);
    const [data,    setData]    = useState<PageResponse<Transaction> | null>(null);
    const [wallet,  setWallet]  = useState<WalletResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPage = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const [res, w] = await Promise.all([
                transactionService.getHistory(p, PAGE_SIZE),
                walletService.getMyWallet(),
            ]);
            setData(res.data.data);
            setWallet(w.data.data);
            setPage(p);
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    const transactions: Transaction[] = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <AppLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {data ? `Tổng ${data.totalElements} giao dịch` : 'Đang tải...'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Current balance badge */}
                        {wallet && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700 font-medium">
                                <Wallet className="w-4 h-4 text-blue-500" />
                                <span>Số dư hiện tại:</span>
                                <span className="font-bold">{wallet.balance}</span>
                            </div>
                        )}
                        <button onClick={() => fetchPage(page)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all">
                            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    {(Object.entries(DISPLAY_CFG) as [DisplayType, typeof DISPLAY_CFG[DisplayType]][]).map(([key, cfg]) => (
                        <span key={key} className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold', cfg.badgeCls)}>
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                        </span>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Đang tải giao dịch...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                            <ArrowDownLeft className="w-12 h-12 opacity-30" />
                            <p className="text-sm font-medium">Chưa có giao dịch nào</p>
                            <p className="text-xs">Hãy nạp tiền hoặc thực hiện chuyển tiền để bắt đầu</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <th className="px-6 py-3.5 text-left">Loại</th>
                                    <th className="px-6 py-3.5 text-left">Đối tác</th>
                                    <th className="px-6 py-3.5 text-left">Thời gian</th>
                                    <th className="px-6 py-3.5 text-center">Trạng thái</th>
                                    <th className="px-6 py-3.5 text-right">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((tx) => {
                                    const dt  = (tx.displayType ?? (tx.type === 'DEPOSIT' ? 'DEPOSIT' : 'TRANSFER')) as DisplayType;
                                    const cfg = DISPLAY_CFG[dt] ?? DISPLAY_CFG.TRANSFER;
                                    const sc  = STATUS_CFG[tx.status] ?? STATUS_CFG.PENDING;
                                    const Icon = cfg.icon;
                                    return (
                                        <tr key={tx.transactionId} className="hover:bg-gray-50 transition-colors group">
                                            {/* Loại */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center shrink-0', cfg.iconBg)}>
                                                        <Icon className={clsx('w-4 h-4', cfg.amountCls)} />
                                                    </div>
                                                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', cfg.badgeCls)}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Đối tác */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">{tx.counterpart || '—'}</p>
                                                {/* Ghi chú đẩy xuống dưới đối tác */}
                                                {tx.referenceNote && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-40">{tx.referenceNote}</p>
                                                )}
                                            </td>

                                            {/* Thời gian */}
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">{tx.createdAt}</td>

                                            {/* Trạng thái */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold', sc.cls)}>
                                                    {sc.label}
                                                </span>
                                            </td>

                                            {/* Số tiền có dấu +/- */}
                                            <td className={clsx('px-6 py-4 text-right font-bold text-base', cfg.amountCls)}>
                                                {tx.amountSigned ?? (dt === 'TRANSFER' ? '−' : '+') + tx.amount}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                                <button key={i} onClick={() => fetchPage(i)}
                                    className={clsx('w-9 h-9 rounded-lg text-sm font-medium transition-all border',
                                        i === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100')}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

