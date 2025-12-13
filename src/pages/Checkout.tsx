import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user's saved shipping address
  const fetchShippingAddress = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('shipping_address, shipping_city, shipping_country, shipping_postal_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          address: data.shipping_address || '',
          city: data.shipping_city || '',
          country: data.shipping_country || '',
          postalCode: data.shipping_postal_code || '',
        });
      }
    } catch (error) {
      console.error('Error fetching shipping address:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchShippingAddress();
  }, [fetchShippingAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: totalPrice,
            status: 'pending',
            shipping_address: formData.address,
            shipping_city: formData.city,
            shipping_country: formData.country,
            shipping_postal_code: formData.postalCode,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        book_id: item.book.id,
        quantity: item.quantity,
        price: item.book.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });

      clearCart();
      setIsProcessing(false);
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Add some books before checking out.</p>
            <Link to="/books">
              <Button variant="burgundy" size="lg">Browse Books</Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-8 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <Link to="/cart" className="inline-flex items-center gap-2 text-white/70 hover:text-gold transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white">
            Secure <span className="text-gold">Checkout</span>
          </h1>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Address */}
                <div className="bg-card rounded-lg p-6 shadow-elegant">
                  <h2 className="font-serif text-xl text-foreground mb-4">Shipping Address</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="address"
                      placeholder="Street Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold md:col-span-2"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold md:col-span-2"
                    />
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-card rounded-lg p-6 shadow-elegant">
                  <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gold" />
                    Payment
                  </h2>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Payment integration with Stripe will be enabled once the backend is connected.
                      For now, orders are simulated.
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="xl" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Place Order - {totalPrice.toLocaleString()} RWF
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-lg p-6 shadow-elegant sticky top-24">
                <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.book.id} className="flex gap-3">
                      <div className="w-16 h-20 bg-gradient-to-br from-primary to-deep-blue-light rounded flex items-center justify-center shrink-0">
                        <span className="text-gold text-xs">{item.quantity}x</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-foreground text-sm font-medium line-clamp-2">
                          {item.book.title}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {(item.book.price * item.quantity).toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{totalPrice.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-burgundy">{totalPrice.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
