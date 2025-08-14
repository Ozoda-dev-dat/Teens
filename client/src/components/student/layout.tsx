import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { TeensITLogo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'student') {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Don't render if user is not authenticated or is not student
  if (!user || user.role !== 'student') {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard' },
    { name: 'Attendance', href: '/student/attendance' },
    { name: 'My Medals', href: '/student/medals' },
    { name: 'Marketplace', href: '/student/marketplace' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TeensITLogo />
              <span className="ml-2 text-lg font-bold text-teens-navy">School</span>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-8">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`px-1 pt-1 border-b-2 text-sm font-medium ${
                          isActive
                            ? 'text-teens-navy border-teens-navy'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                        data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-teens-navy rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-4 text-sm text-gray-500 hover:text-gray-700"
                  data-testid="button-logout"
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
