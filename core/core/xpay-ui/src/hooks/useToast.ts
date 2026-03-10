import { useState, useCallback } from 'react';
import type { ToastData, ToastType } from '../components/Toast';

export function useToast() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, title, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (title: string, message?: string) => addToast('success', title, message),
        error:   (title: string, message?: string) => addToast('error',   title, message),
        warning: (title: string, message?: string) => addToast('warning', title, message),
    };

    return { toasts, toast, removeToast };
}

