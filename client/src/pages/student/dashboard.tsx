import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import StudentLayout from '@/components/student/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Award, Users } from 'lucide-react';
import { type StudentWithUser } from '@/lib/types';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: student, isLoading } = useQuery<StudentWithUser>({
    queryKey: ['/api/students/current'],
    queryFn: async () => {
      const response = await fetch(`/api/students/current?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch student data');
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="text-center py-8">Loading your dashboard...</div>
      </StudentLayout>
    );
  }

  if (!student) {
    return (
      <StudentLayout>
        <div className="text-center py-8 text-gray-500">
          Student record not found. Please contact your administrator.
        </div>
      </StudentLayout>
    );
  }

  const attendanceRate = 92; // This would come from actual attendance data

  return (
    <StudentLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="welcome-message">
          Welcome back, {user?.name}!
        </h1>
        
        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                    <dd className="text-lg font-medium text-gray-900" data-testid="stat-attendance-rate">
                      {attendanceRate}%
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-teens-gold rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Gold Medals</dt>
                    <dd className="text-lg font-medium text-gray-900" data-testid="stat-gold-medals">
                      {student.goldMedals || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-teens-silver rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Silver Medals</dt>
                    <dd className="text-lg font-medium text-gray-900" data-testid="stat-silver-medals">
                      {student.silverMedals || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-teens-bronze rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bronze Medals</dt>
                    <dd className="text-lg font-medium text-gray-900" data-testid="stat-bronze-medals">
                      {student.bronzeMedals || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Group Info and Recent Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Group</CardTitle>
            </CardHeader>
            <CardContent>
              {student.group ? (
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teens-navy rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900" data-testid="current-group-name">
                      {student.group.name}
                    </h4>
                    <p className="text-sm text-gray-500" data-testid="current-group-schedule">
                      {student.group.schedule || 'Schedule not set'}
                    </p>
                    <p className="text-sm text-gray-500" data-testid="student-id">
                      Student ID: {student.studentId}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  You are not assigned to any group yet. Please contact your administrator.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(student.goldMedals || 0) > 0 && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-teens-gold rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Gold Medal Achievement</p>
                      <p className="text-xs text-gray-500">Outstanding performance</p>
                    </div>
                  </div>
                )}
                
                {(student.silverMedals || 0) > 0 && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-teens-silver rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Silver Medal Achievement</p>
                      <p className="text-xs text-gray-500">Great work</p>
                    </div>
                  </div>
                )}

                {(student.bronzeMedals || 0) > 0 && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-teens-bronze rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Bronze Medal Achievement</p>
                      <p className="text-xs text-gray-500">Good participation</p>
                    </div>
                  </div>
                )}

                {!student.goldMedals && !student.silverMedals && !student.bronzeMedals && (
                  <div className="text-center py-4 text-gray-500">
                    No achievements yet. Keep working hard to earn your first medal!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
