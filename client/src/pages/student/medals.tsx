import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import StudentLayout from '@/components/student/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { type StudentWithUser, type MedalWithData } from '@/lib/types';
import { format } from 'date-fns';

export default function StudentMedals() {
  const { user } = useAuth();

  const { data: student } = useQuery<StudentWithUser>({
    queryKey: ['/api/students/current'],
    queryFn: async () => {
      const response = await fetch(`/api/students/current?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch student data');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: medals, isLoading } = useQuery<MedalWithData[]>({
    queryKey: ['/api/medals', student?.id],
    queryFn: async () => {
      const response = await fetch(`/api/medals?studentId=${student?.id}`);
      if (!response.ok) throw new Error('Failed to fetch medals');
      return response.json();
    },
    enabled: !!student?.id,
  });

  if (!student) {
    return (
      <StudentLayout>
        <div className="text-center py-8 text-gray-500">
          Student record not found. Please contact your administrator.
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="page-title">
          My Medal Collection
        </h1>
        
        {/* Medal Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="gold-medal-count">
                {student.goldMedals || 0}
              </h3>
              <p className="text-lg font-semibold">Gold Medals</p>
              <p className="text-sm opacity-90">Excellence in projects</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-300 to-gray-500 text-white text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="silver-medal-count">
                {student.silverMedals || 0}
              </h3>
              <p className="text-lg font-semibold">Silver Medals</p>
              <p className="text-sm opacity-90">Good performance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="bronze-medal-count">
                {student.bronzeMedals || 0}
              </h3>
              <p className="text-lg font-semibold">Bronze Medals</p>
              <p className="text-sm opacity-90">Participation awards</p>
            </CardContent>
          </Card>
        </div>

        {/* Medal History */}
        <Card>
          <CardHeader>
            <CardTitle>Medal History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading medal history...</div>
            ) : !medals || medals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No medals earned yet. Keep working hard to earn your first medal!
              </div>
            ) : (
              <div className="space-y-4">
                {medals
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((medal) => (
                    <div 
                      key={medal.id} 
                      className="flex items-center p-4 bg-gray-50 rounded-lg"
                      data-testid={`medal-item-${medal.id}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        medal.type === 'gold' ? 'bg-teens-gold' :
                        medal.type === 'silver' ? 'bg-teens-silver' : 'bg-teens-bronze'
                      }`}>
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center mb-1">
                          <h4 className="text-lg font-semibold text-gray-900 mr-3">
                            {medal.type.charAt(0).toUpperCase() + medal.type.slice(1)} Medal
                          </h4>
                          <Badge className={
                            medal.type === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            medal.type === 'silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            {medal.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Awarded for:</strong> {medal.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(medal.createdAt), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Recent
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
