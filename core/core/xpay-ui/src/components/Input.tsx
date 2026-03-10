import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={clsx(
                            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200',
                            'placeholder:text-gray-400',
                            'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                            error
                                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                                : 'border-gray-200 hover:border-gray-300',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <span>&#9888;</span> {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;

