import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import StudentLayout from '@/components/student/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type StudentWithUser } from '@/lib/types';
import { type Attendance } from '@shared/schema';
import { format } from 'date-fns';

export default function StudentAttendance() {
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

  const { data: attendance, isLoading } = useQuery<Attendance[]>({
    queryKey: ['/api/attendance', student?.id],
    queryFn: async () => {
      const response = await fetch(`/api/attendance?studentId=${student?.id}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
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

  // Calculate attendance statistics
  const totalClasses = attendance?.length || 0;
  const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
  const lateCount = attendance?.filter(a => a.status === 'late').length || 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length || 0;
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  return (
    <StudentLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="page-title">
          My Attendance
        </h1>
        
        {/* Attendance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="text-center">
                <dt className="text-sm font-medium text-gray-500">Attendance Rate</dt>
                <dd className="text-2xl font-bold text-teens-navy" data-testid="attendance-rate">
                  {attendanceRate}%
                </dd>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-center">
                <dt className="text-sm font-medium text-gray-500">Present</dt>
                <dd className="text-2xl font-bold text-green-600" data-testid="present-count">
                  {presentCount}
                </dd>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-center">
                <dt className="text-sm font-medium text-gray-500">Late</dt>
                <dd className="text-2xl font-bold text-yellow-600" data-testid="late-count">
                  {lateCount}
                </dd>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-center">
                <dt className="text-sm font-medium text-gray-500">Absent</dt>
                <dd className="text-2xl font-bold text-teens-red" data-testid="absent-count">
                  {absentCount}
                </dd>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading attendance history...</div>
            ) : !attendance || attendance.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attendance records found. Attendance will appear here once classes begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <TableRow key={record.id} data-testid={`attendance-row-${record.id}`}>
                          <TableCell className="font-medium">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                record.status === 'present' ? 'default' :
                                record.status === 'late' ? 'secondary' : 'destructive'
                              }
                              className={
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                              data-testid={`status-${record.status}`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {record.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
