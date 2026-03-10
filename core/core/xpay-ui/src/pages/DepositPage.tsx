import { useState } from 'react';
import { PlusCircle, DollarSign, FileText, CheckCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import { walletService } from '../api/services';
import type { WalletResponse, ErrorResponse } from '../types';
import AppLayout from '../components/AppLayout';
import Input from '../components/Input';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { clsx } from 'clsx';

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

function formatVND(val: string) {
    const num = val.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('vi-VN') : '';
}

export default function DepositPage() {
    const { toasts, toast, removeToast } = useToast();
    const [amount, setAmount] = useState('');
    const [note,   setNote]   = useState('');
    const [amtErr, setAmtErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [newBalance, setNewBalance] = useState<string | null>(null);

    const rawAmount = () => Number(amount.replace(/\D/g, ''));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAmtErr('');
        if (!amount) { setAmtErr('Vui lòng nhập số tiền'); return; }
        if (rawAmount() < 1000) { setAmtErr('Số tiền tối thiểu là 1.000 VND'); return; }

        setLoading(true);
        setNewBalance(null);
        try {
            const res = await walletService.deposit({
                amount: rawAmount(),
                referenceNote: note.trim() || undefined,
            });
            const wallet: WalletResponse = res.data.data;
            setNewBalance(wallet.balance);
            toast.success('Nạp tiền thành công!', `Số dư mới: ${wallet.balance}`);
            setAmount(''); setNote('');
        } catch (err) {
            const axErr = err as AxiosError<ErrorResponse>;
            const msg = axErr.response?.data?.message ?? 'Nạp tiền thất bại, vui lòng thử lại.';
            toast.error('Nạp tiền thất bại', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <div className="p-8 max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nạp tiền</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Nạp tiền vào ví XPay của bạn để bắt đầu giao dịch.</p>
                </div>

                {/* Success banner */}
                {newBalance && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-800">Nạp tiền thành công!</p>
                            <p className="text-sm text-green-600 mt-0.5">Số dư hiện tại: <strong>{newBalance}</strong></p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <Input
                            label="Số tiền muốn nạp (VND)"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(formatVND(e.target.value))}
                            error={amtErr}
                            leftIcon={<DollarSign className="w-4 h-4" />}
                            inputMode="numeric"
                        />
                        {/* Quick amounts */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {QUICK_AMOUNTS.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setAmount(n.toLocaleString('vi-VN'))}
                                    className={clsx(
                                        'py-2 rounded-xl text-xs font-medium border transition-all',
                                        amount === n.toLocaleString('vi-VN')
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
                                    )}
                                >
                                    +{n >= 1_000_000 ? `${n / 1_000_000}tr` : `${n / 1000}k`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        label="Ghi chú (tuỳ chọn)"
                        placeholder="Ví dụ: Nạp từ ngân hàng VCB..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        leftIcon={<FileText className="w-4 h-4" />}
                    />

                    {/* Summary */}
                    {amount && (
                        <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                            <span className="text-green-700">Số tiền sẽ được cộng vào ví</span>
                            <span className="font-bold text-green-800 text-base">{amount} VND</span>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Đang xử lý...</>
                        ) : (
                            <><PlusCircle className="w-4 h-4" /> Xác nhận nạp tiền</>
                        )}
                    </button>
                </div>

                {/* Info note */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                    <p className="font-medium mb-1">ℹ️ Lưu ý</p>
                    <ul className="space-y-1 text-xs text-blue-600 list-disc list-inside">
                        <li>Số tiền nạp tối thiểu: 1.000 VND</li>
                        <li>Tiền sẽ được cộng ngay vào ví sau khi xác nhận</li>
                        <li>Giao dịch nạp tiền không thể hoàn tác</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}

