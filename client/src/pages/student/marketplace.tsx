import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import StudentLayout from '@/components/student/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type StudentWithUser } from '@/lib/types';
import { type Product } from '@shared/schema';

export default function StudentMarketplace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: student } = useQuery<StudentWithUser>({
    queryKey: ['/api/students/current'],
    queryFn: async () => {
      const response = await fetch(`/api/students/current?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch student data');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (!student) throw new Error('Student not found');
      
      return apiRequest('POST', '/api/purchases', {
        studentId: student.id,
        productId: product.id,
        goldSpent: product.goldPrice || 0,
        silverSpent: product.silverPrice || 0,
        bronzeSpent: product.bronzePrice || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students/current'] });
      setIsDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: 'Purchase Successful!',
        description: 'Your item will be delivered soon.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Insufficient medals or product unavailable',
        variant: 'destructive',
      });
    },
  });

  const handlePurchaseClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const confirmPurchase = () => {
    if (selectedProduct) {
      purchaseMutation.mutate(selectedProduct);
    }
  };

  const canAfford = (product: Product) => {
    if (!student) return false;
    
    const hasGold = (student.goldMedals || 0) >= (product.goldPrice || 0);
    const hasSilver = (student.silverMedals || 0) >= (product.silverPrice || 0);
    const hasBronze = (student.bronzeMedals || 0) >= (product.bronzePrice || 0);
    
    return hasGold && hasSilver && hasBronze;
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            Marketplace
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Your Balance:</span>
            <div className="flex space-x-1" data-testid="medal-balance">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <span className="w-3 h-3 bg-teens-gold rounded-full mr-1"></span>
                {student.goldMedals || 0}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <span className="w-3 h-3 bg-teens-silver rounded-full mr-1"></span>
                {student.silverMedals || 0}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <span className="w-3 h-3 bg-teens-bronze rounded-full mr-1"></span>
                {student.bronzeMedals || 0}
              </span>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading marketplace...</div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products available at the moment. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter(product => product.inStock)
              .map((product) => {
                const affordable = canAfford(product);
                
                return (
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
                        {affordable ? (
                          <Button
                            className="bg-teens-navy text-white hover:bg-blue-700"
                            onClick={() => handlePurchaseClick(product)}
                            data-testid={`button-purchase-${product.id}`}
                          >
                            Purchase
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="bg-gray-300 text-gray-500 cursor-not-allowed"
                            data-testid={`button-insufficient-${product.id}`}
                          >
                            Insufficient Medals
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Purchase Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to purchase <strong>{selectedProduct.name}</strong>?
                </p>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required medals:</p>
                  <div className="flex space-x-2">
                    {getMedalDisplay(selectedProduct)}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-purchase"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-teens-navy text-white hover:bg-blue-700"
                    onClick={confirmPurchase}
                    disabled={purchaseMutation.isPending}
                    data-testid="button-confirm-purchase"
                  >
                    {purchaseMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
}
