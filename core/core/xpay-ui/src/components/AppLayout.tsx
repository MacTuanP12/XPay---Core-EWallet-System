import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Clock, PlusCircle, LogOut, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';

const navItems = [
    { to: '/dashboard',    icon: LayoutDashboard, label: 'Tổng quan'      },
    { to: '/deposit',      icon: PlusCircle,      label: 'Nạp tiền'       },
    { to: '/transfer',     icon: ArrowLeftRight,  label: 'Chuyển tiền'    },
    { to: '/transactions', icon: Clock,           label: 'Lịch sử GD'     },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-60 bg-linear-to-b from-blue-700 to-blue-900 text-white flex flex-col shrink-0">
                {/* Brand */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-600/40">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight">XPay</p>
                        <p className="text-xs text-blue-200">Ví điện tử</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                                isActive
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-blue-100 hover:bg-white/10'
                            )}
                        >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="px-4 py-4 border-t border-blue-600/40">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold uppercase">
                            {username?.[0] ?? '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{username}</p>
                            <p className="text-xs text-blue-300">Tài khoản</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}

