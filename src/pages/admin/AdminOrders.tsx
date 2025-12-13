import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Eye, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal_code: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
  order_items: {
    quantity: number;
    price: number;
    books: {
      title: string;
    };
  }[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (email, full_name),
          order_items (
            quantity,
            price,
            books (title)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = orders.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });

      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as 'pending' | 'processing' | 'completed' | 'cancelled' });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      processing: { variant: 'default', className: 'bg-blue-100 text-blue-800' },
      completed: { variant: 'default', className: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">
          Order <span className="text-gold">Management</span>
        </h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              All Orders ({filteredOrders.length})
            </span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.profiles.full_name || 'No name'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.profiles.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.order_items.length} items</TableCell>
                    <TableCell className="font-semibold">
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p>{selectedOrder.profiles.full_name || 'No name'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.profiles.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        updateOrderStatus(selectedOrder.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_country}{' '}
                    {selectedOrder.shipping_postal_code}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Items</p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.books.title}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-right">
                  <p className="text-lg font-semibold">
                    Total: ${selectedOrder.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
