import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertProductSchema, type Product } from '@shared/schema';
import { z } from 'zod';

const formSchema = insertProductSchema.extend({
  goldPrice: z.coerce.number().min(0).default(0),
  silverPrice: z.coerce.number().min(0).default(0),
  bronzePrice: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminMarketplace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      goldPrice: 0,
      silverPrice: 0,
      bronzePrice: 0,
      inStock: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createProductMutation.mutate(data);
  };

  const getMedalDisplay = (product: Product) => {
    const medals = [];
    if (product.goldPrice && product.goldPrice > 0) {
      medals.push(
        <span key="gold" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <span className="w-3 h-3 bg-teens-gold rounded-full mr-1"></span>
          {product.goldPrice}
        </span>
      );
    }
    if (product.silverPrice && product.silverPrice > 0) {
      medals.push(
        <span key="silver" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <span className="w-3 h-3 bg-teens-silver rounded-full mr-1"></span>
          {product.silverPrice}
        </span>
      );
    }
    if (product.bronzePrice && product.bronzePrice > 0) {
      medals.push(
        <span key="bronze" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <span className="w-3 h-3 bg-teens-bronze rounded-full mr-1"></span>
          {product.bronzePrice}
        </span>
      );
    }
    return medals.length > 0 ? medals : <span className="text-gray-500">Free</span>;
  };

  return (
    <AdminLayout title="Marketplace Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Marketplace Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teens-navy text-white hover:bg-blue-700" data-testid="button-add-product">
              + Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} data-testid="input-product-name" />
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
                        <Textarea placeholder="Product description" {...field} data-testid="input-product-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-product-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="goldPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gold Medal Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-product-gold-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="silverPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Silver Medal Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-product-silver-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bronzePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bronze Medal Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-product-bronze-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    disabled={createProductMutation.isPending}
                    className="bg-teens-navy text-white hover:bg-blue-700"
                    data-testid="button-submit-product"
                  >
                    {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden" data-testid={`product-card-${product.id}`}>
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 flex-wrap">
                    {getMedalDisplay(product)}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-teens-navy hover:text-blue-900"
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-teens-red hover:text-red-900"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      disabled={deleteProductMutation.isPending}
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {!product.inStock && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
