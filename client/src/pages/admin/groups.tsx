import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertGroupSchema, type Group } from '@shared/schema';
import { z } from 'zod';

const formSchema = insertGroupSchema.extend({
  capacity: z.coerce.number().min(1).default(30),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminGroups() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      schedule: '',
      capacity: 30,
      status: 'active',
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/groups', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Group created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: 'Success',
        description: 'Group deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createGroupMutation.mutate(data);
  };

  return (
    <AdminLayout title="Groups Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Groups Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teens-navy text-white hover:bg-blue-700" data-testid="button-create-group">
              + Create New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group name" {...field} data-testid="input-group-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Group description" {...field} data-testid="input-group-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mon, Wed, Fri - 10:00 AM" {...field} data-testid="input-group-schedule" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} data-testid="input-group-capacity" />
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
                    disabled={createGroupMutation.isPending}
                    className="bg-teens-navy text-white hover:bg-blue-700"
                    data-testid="button-submit-group"
                  >
                    {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
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
            <div className="text-center py-8">Loading groups...</div>
          ) : !groups || groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No groups found. Create your first group to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id} data-testid={`group-row-${group.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{group.name}</div>
                        {group.description && (
                          <div className="text-sm text-gray-500">{group.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{group.schedule || 'Not set'}</TableCell>
                    <TableCell>{group.capacity || 30}</TableCell>
                    <TableCell>
                      <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-teens-navy hover:text-blue-900"
                          data-testid={`button-edit-${group.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-teens-red hover:text-red-900"
                          onClick={() => deleteGroupMutation.mutate(group.id)}
                          disabled={deleteGroupMutation.isPending}
                          data-testid={`button-delete-${group.id}`}
                        >
                          Delete
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
