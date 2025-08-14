import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { TeensITLogo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@mail.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    setLocation(user.role === 'admin' ? '/admin' : '/student');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      const userData = localStorage.getItem('auth-user');
      if (userData) {
        const user = JSON.parse(userData);
        setLocation(user.role === 'admin' ? '/admin' : '/student');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setEmail('admin@mail.com');
      setPassword('admin123');
    } else {
      setEmail('student@mail.com');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teens-navy to-blue-800">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <TeensITLogo size="large" className="text-white" />
            </div>
            <p className="text-white/80 text-sm mt-2">SCHOOL</p>
            <h2 className="text-3xl font-bold text-white mt-4">CRM System</h2>
            <p className="mt-2 text-sm text-white/80">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="sr-only">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full"
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="password" className="sr-only">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full"
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teens-red hover:bg-red-700 text-white"
                data-testid="button-login"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-teens-red text-teens-red hover:bg-teens-red hover:text-white"
                  onClick={() => handleDemoLogin('admin')}
                  data-testid="button-admin-demo"
                >
                  Admin Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-teens-red text-teens-red hover:bg-teens-red hover:text-white"
                  onClick={() => handleDemoLogin('student')}
                  data-testid="button-student-demo"
                >
                  Student Demo
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-white/60">Demo Credentials:</p>
              <p className="text-xs text-white/80">Admin: admin@mail.com / admin123</p>
              <p className="text-xs text-white/80">Student: student@mail.com / student123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
