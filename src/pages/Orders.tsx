import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  id: string;
  book_id: string;
  quantity: number;
  price: number;
  books: {
    title: string;
    cover_image: string | null;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  order_items: OrderItem[];
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            books (
              title,
              cover_image
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });

      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-6 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-2xl md:text-3xl text-white">
            My <span className="text-gold">Orders</span>
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-12 bg-background min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-4xl">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="font-serif text-2xl text-foreground mb-4">No Orders Yet</h2>
              <p className="text-muted-foreground mb-8">
                Start shopping to see your orders here
              </p>
              <Button variant="burgundy" onClick={() => window.location.href = '/books'}>
                Browse Books
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <CardTitle className="text-lg">
                              Order #{order.id.slice(0, 8)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Order Summary */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-serif text-2xl text-burgundy">
                            {order.total_amount.toLocaleString()} RWF
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Items</p>
                          <p className="font-semibold">
                            {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                          </p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Shipping To:
                        </p>
                        <p className="text-sm">
                          {order.shipping_address}, {order.shipping_city}, {order.shipping_country}
                        </p>
                      </div>

                      {/* Order Items Toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mb-4"
                        onClick={() =>
                          setExpandedOrder(expandedOrder === order.id ? null : order.id)
                        }
                      >
                        {expandedOrder === order.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Hide Items
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View Items ({order.order_items.length})
                          </>
                        )}
                      </Button>

                      {/* Order Items List */}
                      {expandedOrder === order.id && (
                        <div className="space-y-3 mb-4 p-4 bg-muted rounded-lg">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-16 bg-gradient-to-br from-primary to-deep-blue-light rounded flex items-center justify-center shrink-0 overflow-hidden">
                                {item.books.cover_image ? (
                                  <img
                                    src={item.books.cover_image}
                                    alt={item.books.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-gold/50" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium text-sm">{item.books.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} × {item.price.toLocaleString()} RWF
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {(item.quantity * item.price).toLocaleString()} RWF
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cancel Button */}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrder === order.id}
                        >
                          {cancellingOrder === order.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Orders;
