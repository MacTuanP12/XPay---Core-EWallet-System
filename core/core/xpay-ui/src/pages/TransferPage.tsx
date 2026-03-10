import { useState } from 'react';
import { ArrowUpRight, User, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import { walletService } from '../api/services';
import type { TransferResponse, ErrorResponse } from '../types';
import AppLayout from '../components/AppLayout';
import Input from '../components/Input';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { clsx } from 'clsx';

interface FormErrors { receiverUsername?: string; amount?: string; }

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000];

function formatVND(val: string) {
    const num = val.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('vi-VN') : '';
}

export default function TransferPage() {
    const { toasts, toast, removeToast } = useToast();
    const [receiver, setReceiver] = useState('');
    const [amount,   setAmount]   = useState('');
    const [message,  setMessage]  = useState('');
    const [errors,   setErrors]   = useState<FormErrors>({});
    const [loading,  setLoading]  = useState(false);
    const [result,   setResult]   = useState<TransferResponse | null>(null);

    const rawAmount = () => Number(amount.replace(/\D/g, ''));

    const validate = () => {
        const e: FormErrors = {};
        if (!receiver.trim()) e.receiverUsername = 'Vui lòng nhập tên người nhận';
        if (!amount)          e.amount = 'Vui lòng nhập số tiền';
        else if (rawAmount() < 1000) e.amount = 'Số tiền tối thiểu là 1.000 VND';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await walletService.transfer({
                receiverUsername: receiver.trim(),
                amount: rawAmount(),
                message: message.trim() || undefined,
            });
            setResult(res.data.data);
            toast.success('Chuyển tiền thành công!', `Đã chuyển ${res.data.data.amount} đến ${res.data.data.receiverUsername}`);
            setReceiver(''); setAmount(''); setMessage('');
        } catch (err) {
            const axErr = err as AxiosError<ErrorResponse>;
            const code = axErr.response?.data?.error;
            const msg  = axErr.response?.data?.message ?? 'Chuyển tiền thất bại.';

            if (code === 'INSUFFICIENT_BALANCE') {
                toast.error('Số dư không đủ', msg);
            } else if (code === 'INVALID_TRANSACTION') {
                toast.error('Giao dịch không hợp lệ', msg);
            } else {
                toast.error('Lỗi chuyển tiền', msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <div className="p-8 max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chuyển tiền</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Chuyển tiền nhanh đến tài khoản khác trong hệ thống XPay.</p>
                </div>

                {/* Success result */}
                {result && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="font-semibold text-green-800">Giao dịch thành công</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                ['Mã GD', result.transactionId],
                                ['Người nhận', result.receiverUsername],
                                ['Số tiền', result.amount],
                                ['Số dư còn lại', result.remainingBalance],
                            ].map(([l, v]) => (
                                <div key={l}>
                                    <p className="text-xs text-green-600">{l}</p>
                                    <p className="font-medium text-green-900">{v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <Input
                        label="Tên đăng nhập người nhận"
                        placeholder="Nhập username người nhận..."
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        error={errors.receiverUsername}
                        leftIcon={<User className="w-4 h-4" />}
                    />

                    <div>
                        <Input
                            label="Số tiền (VND)"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(formatVND(e.target.value))}
                            error={errors.amount}
                            leftIcon={<DollarSign className="w-4 h-4" />}
                            inputMode="numeric"
                        />
                        {/* Quick amounts */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {QUICK_AMOUNTS.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setAmount(n.toLocaleString('vi-VN'))}
                                    className={clsx(
                                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                        amount === n.toLocaleString('vi-VN')
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                    )}
                                >
                                    {n.toLocaleString('vi-VN')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Lời nhắn (tuỳ chọn)</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                            <textarea
                                rows={2}
                                placeholder="Nhập nội dung chuyển khoản..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 hover:border-gray-300 transition-all"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    {amount && receiver && (
                        <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                            <span className="text-blue-700">Chuyển đến <strong>{receiver}</strong></span>
                            <span className="font-bold text-blue-800">{amount} VND</span>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Đang xử lý...</>
                        ) : (
                            <><ArrowUpRight className="w-4 h-4" /> Xác nhận chuyển tiền</>
                        )}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}

