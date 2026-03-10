import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastProps extends ToastData {
    onClose: (id: string) => void;
}

function Toast({ id, type, title, message, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose(id), 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const config = {
        success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', iconColor: 'text-green-500', titleColor: 'text-green-800', msgColor: 'text-green-600' },
        error:   { icon: XCircle,     bg: 'bg-red-50',   border: 'border-red-200',   iconColor: 'text-red-500',   titleColor: 'text-red-800',   msgColor: 'text-red-600'   },
        warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-500', titleColor: 'text-amber-800', msgColor: 'text-amber-600' },
    }[type];

    const Icon = config.icon;

    return (
        <div className={clsx(
            'flex items-start gap-3 w-80 rounded-xl border p-4 shadow-lg transition-all duration-300',
            config.bg, config.border,
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        )}>
            <Icon className={clsx('w-5 h-5 mt-0.5 shrink-0', config.iconColor)} />
            <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-semibold', config.titleColor)}>{title}</p>
                {message && <p className={clsx('text-xs mt-0.5', config.msgColor)}>{message}</p>}
            </div>
            <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastData[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => <Toast key={t.id} {...t} onClose={onClose} />)}
        </div>
    );
}

