import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertAttendanceSchema, type Group, type Attendance } from '@shared/schema';
import { type StudentWithUser } from '@/lib/types';
import { z } from 'zod';
import { format } from 'date-fns';

const formSchema = insertAttendanceSchema.extend({
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminAttendance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const { data: students } = useQuery<StudentWithUser[]>({
    queryKey: ['/api/students'],
  });

  const { data: attendance } = useQuery<Attendance[]>({
    queryKey: ['/api/attendance'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      groupId: '',
      status: 'present',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/attendance', {
        ...data,
        date: new Date(data.date),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Attendance recorded successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to record attendance',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createAttendanceMutation.mutate(data);
  };

  // Filter students by selected group
  const filteredStudents = selectedGroupId 
    ? students?.filter(s => s.groupId === selectedGroupId)
    : students;

  return (
    <AdminLayout title="Attendance Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Group</label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger data-testid="select-filter-group">
                      <SelectValue placeholder="All Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Groups</SelectItem>
                      {groups?.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teens-navy" 
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                    data-testid="input-attendance-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Students</span>
                <span className="text-sm font-medium text-gray-900" data-testid="stat-total-students">
                  {filteredStudents?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Present Today</span>
                <span className="text-sm font-medium text-green-600" data-testid="stat-present-today">
                  {attendance?.filter(a => a.status === 'present').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Absent</span>
                <span className="text-sm font-medium text-teens-red" data-testid="stat-absent-today">
                  {attendance?.filter(a => a.status === 'absent').length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Attendance Records</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teens-navy text-white hover:bg-blue-700" data-testid="button-take-attendance">
              Take Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Attendance</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-attendance-group">
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups?.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-attendance-student">
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students?.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.user?.name} ({student.studentId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-attendance-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teens-navy"
                          {...field}
                          data-testid="input-attendance-form-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAttendanceMutation.isPending}
                    className="bg-teens-navy text-white hover:bg-blue-700"
                    data-testid="button-submit-attendance"
                  >
                    {createAttendanceMutation.isPending ? 'Recording...' : 'Record Attendance'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          {!attendance || attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found. Start taking attendance to see records here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => {
                  const student = students?.find(s => s.id === record.studentId);
                  const group = groups?.find(g => g.id === record.groupId);
                  
                  return (
                    <TableRow key={record.id} data-testid={`attendance-row-${record.id}`}>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {student?.user?.name || 'Unknown'} ({student?.studentId || 'N/A'})
                      </TableCell>
                      <TableCell>{group?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            record.status === 'present' ? 'default' : 
                            record.status === 'late' ? 'secondary' : 'destructive'
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
