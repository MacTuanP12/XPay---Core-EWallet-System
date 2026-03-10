import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, Receipt, LogOut, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';

const navItems = [
    { to: '/admin',              icon: LayoutDashboard, label: 'Tổng quan'      },
    { to: '/admin/users',        icon: Users,           label: 'Quản lý User'   },
    { to: '/admin/kyc',          icon: ShieldCheck,     label: 'Phê duyệt KYC'  },
    { to: '/admin/transactions', icon: Receipt,         label: 'Tra soát GD'    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 shadow-xl">
                {/* Brand */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight">XPay Admin</p>
                        <p className="text-xs text-gray-400">Control Panel</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/admin'}
                            className={({ isActive }) => clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="px-4 py-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold uppercase">
                            {username?.[0] ?? 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate text-white">{username}</p>
                            <p className="text-xs text-gray-400">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}

