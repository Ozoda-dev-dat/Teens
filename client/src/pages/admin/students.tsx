import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertStudentSchema, insertUserSchema, type Group } from '@shared/schema';
import { type StudentWithUser } from '@/lib/types';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  studentId: z.string().min(1, 'Student ID is required'),
  groupId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminStudents() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery<StudentWithUser[]>({
    queryKey: ['/api/students'],
  });

  const { data: groups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      studentId: '',
      groupId: '',
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // First create user
      const userResponse = await apiRequest('POST', '/api/users', {
        name: data.name,
        email: data.email,
        password: 'student123', // Default password
        role: 'student',
      });
      
      const user = await userResponse.json();
      
      // Then create student record
      return apiRequest('POST', '/api/students', {
        userId: user.id,
        studentId: data.studentId,
        groupId: data.groupId || null,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Student added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add student',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createStudentMutation.mutate(data);
  };

  return (
    <AdminLayout title="Students Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Students Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teens-navy text-white hover:bg-blue-700" data-testid="button-add-student">
              + Add New Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student name" {...field} data-testid="input-student-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="student@example.com" {...field} data-testid="input-student-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="TIT-2024-002" {...field} data-testid="input-student-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-student-group">
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Group</SelectItem>
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
                    disabled={createStudentMutation.isPending}
                    className="bg-teens-navy text-white hover:bg-blue-700"
                    data-testid="button-submit-student"
                  >
                    {createStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : !students || students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found. Add your first student to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Medals</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} data-testid={`student-row-${student.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-teens-navy rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {student.user?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{student.user?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{student.user?.email || 'No email'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{student.studentId}</TableCell>
                    <TableCell>{student.group?.name || 'No Group'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {student.goldMedals > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-teens-gold rounded-full text-xs text-white font-medium">
                            {student.goldMedals}
                          </span>
                        )}
                        {student.silverMedals > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-teens-silver rounded-full text-xs text-white font-medium">
                            {student.silverMedals}
                          </span>
                        )}
                        {student.bronzeMedals > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-teens-bronze rounded-full text-xs text-white font-medium">
                            {student.bronzeMedals}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-teens-navy hover:text-blue-900"
                          data-testid={`button-edit-${student.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-900"
                          data-testid={`button-award-medal-${student.id}`}
                        >
                          Award Medal
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
