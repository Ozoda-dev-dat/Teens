import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { TeensITLogo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, CheckCircle, Award, ShoppingBag, LayoutDashboard } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Don't render if user is not authenticated or is not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Groups', href: '/admin/groups', icon: Users },
    { name: 'Students', href: '/admin/students', icon: BookOpen },
    { name: 'Attendance', href: '/admin/attendance', icon: CheckCircle },
    { name: 'Medals', href: '/admin/medals', icon: Award },
    { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center h-16 px-6 bg-teens-navy">
          <TeensITLogo className="text-white" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-blue-50 text-teens-navy' 
                      : 'text-gray-600 hover:text-teens-navy hover:bg-gray-50'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-teens-navy rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-700"
            data-testid="button-logout"
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900" data-testid="page-title">
              {title}
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
