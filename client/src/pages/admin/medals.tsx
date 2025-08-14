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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { insertMedalSchema } from '@shared/schema';
import { type StudentWithUser, type MedalWithData } from '@/lib/types';
import { z } from 'zod';
import { format } from 'date-fns';

const formSchema = insertMedalSchema.omit({ awardedBy: true });

type FormData = z.infer<typeof formSchema>;

export default function AdminMedals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students } = useQuery<StudentWithUser[]>({
    queryKey: ['/api/students'],
  });

  const { data: medals } = useQuery<MedalWithData[]>({
    queryKey: ['/api/medals'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      type: 'bronze',
      reason: '',
    },
  });

  const createMedalMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/medals', {
        ...data,
        awardedBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Medal awarded successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to award medal',
        variant: 'destructive',
      });
    },
  });

  const deleteMedalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/medals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: 'Success',
        description: 'Medal revoked successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to revoke medal',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMedalMutation.mutate(data);
  };

  // Calculate medal totals
  const medalStats = {
    gold: medals?.filter(m => m.type === 'gold').length || 0,
    silver: medals?.filter(m => m.type === 'silver').length || 0,
    bronze: medals?.filter(m => m.type === 'bronze').length || 0,
  };

  return (
    <AdminLayout title="Medal Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Gold Medals</h3>
                <p className="text-2xl font-bold" data-testid="stat-gold-medals">{medalStats.gold}</p>
                <p className="text-sm opacity-90">Awarded this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-300 to-gray-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Silver Medals</h3>
                <p className="text-2xl font-bold" data-testid="stat-silver-medals">{medalStats.silver}</p>
                <p className="text-sm opacity-90">Awarded this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Bronze Medals</h3>
                <p className="text-2xl font-bold" data-testid="stat-bronze-medals">{medalStats.bronze}</p>
                <p className="text-sm opacity-90">Awarded this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Medal Awards</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teens-navy text-white hover:bg-blue-700" data-testid="button-award-medal">
              Award Medal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Medal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-medal-student">
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-medal-type">
                            <SelectValue placeholder="Select medal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gold">Gold Medal</SelectItem>
                          <SelectItem value="silver">Silver Medal</SelectItem>
                          <SelectItem value="bronze">Bronze Medal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for award" {...field} data-testid="input-medal-reason" />
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
                    disabled={createMedalMutation.isPending}
                    className="bg-teens-navy text-white hover:bg-blue-700"
                    data-testid="button-submit-medal"
                  >
                    {createMedalMutation.isPending ? 'Awarding...' : 'Award Medal'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          {!medals || medals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No medals awarded yet. Start awarding medals to recognize student achievements.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Medal Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medals.map((medal) => (
                  <TableRow key={medal.id} data-testid={`medal-row-${medal.id}`}>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {medal.user?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {medal.student?.studentId || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          medal.type === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          medal.type === 'silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }
                      >
                        {medal.type.charAt(0).toUpperCase() + medal.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{medal.reason}</TableCell>
                    <TableCell>{format(new Date(medal.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-teens-red hover:text-red-900"
                        onClick={() => deleteMedalMutation.mutate(medal.id)}
                        disabled={deleteMedalMutation.isPending}
                        data-testid={`button-revoke-${medal.id}`}
                      >
                        Revoke
                      </Button>
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
