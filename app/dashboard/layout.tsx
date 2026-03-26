'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Image, 
  Users, 
  Heart, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', roles: ['all'] },
    { href: '/dashboard/teachings', icon: BookOpen, label: 'Teachings', roles: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'] },
    { href: '/dashboard/events', icon: Calendar, label: 'Events', roles: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'] },
    { href: '/dashboard/gallery', icon: Image, label: 'Gallery', roles: ['super_admin', 'province_pastor', 'media'] },
    { href: '/dashboard/departments', icon: Users, label: 'Departments', roles: ['super_admin'] },
    { href: '/dashboard/groups', icon: Users, label: 'Groups', roles: ['super_admin'] },
    { href: '/dashboard/prayers', icon: Heart, label: 'Prayer Requests', roles: ['super_admin', 'province_pastor'] },
    { href: '/dashboard/users', icon: Users, label: 'Users', roles: ['super_admin'] },
    { href: '/dashboard/approvals', icon: Users, label: 'Pending Approvals', roles: ['super_admin'] },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['all'] },
  ];


//  { href: '/dashboard/gallery', icon: Image, label: 'Gallery', roles: ['super_admin', 'media'] },
//   { href: '/dashboard/departments', icon: Users, label: 'Departments', roles: ['super_admin'] },
//   { href: '/dashboard/groups', icon: Users, label: 'Groups', roles: ['super_admin'] },
//   { href: '/dashboard/prayers', icon: Heart, label: 'Prayer Requests', roles: ['super_admin'] },
//   { href: '/dashboard/users', icon: Users, label: 'Users', roles: ['super_admin'] },








  const accessibleNavItems = navItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(user.role)
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-[#0EBC5F] text-white p-3 rounded-full shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#29156C] flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {accessibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#0EBC5F] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
}