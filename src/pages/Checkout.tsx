import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Lock, ShoppingBag, MapPin } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { stripePromise } from '@/lib/stripe';
import { PaymentForm } from '@/components/PaymentForm';

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [mapCenter, setMapCenter] = useState({ lat: -1.9403, lng: 29.8739 }); // Default: Kigali, Rwanda
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({ lat: -1.9403, lng: 29.8739 });

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Predefined city locations in Rwanda
  const rwandaCities: { [key: string]: { lat: number; lng: number } } = {
    kigali: { lat: -1.9403, lng: 29.8739 },
    butare: { lat: -2.5965, lng: 29.7392 },
    gisenyi: { lat: -1.7025, lng: 29.2560 },
    ruhengeri: { lat: -1.5000, lng: 29.6333 },
    gitarama: { lat: -2.0742, lng: 29.7567 },
    kibuye: { lat: -2.0600, lng: 29.3467 },
    cyangugu: { lat: -2.4846, lng: 28.9073 },
    byumba: { lat: -1.5764, lng: 30.0674 },
    kibungo: { lat: -2.1597, lng: 30.5431 },
    musanze: { lat: -1.4997, lng: 29.6344 },
  };

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

  // Update map based on city selection (no geocoding needed)
  useEffect(() => {
    if (formData.city) {
      const cityKey = formData.city.toLowerCase().trim();
      const cityLocation = rwandaCities[cityKey];
      
      if (cityLocation) {
        setMapCenter(cityLocation);
        setMarkerPosition(cityLocation);
      }
    }
  }, [formData.city]);

  const handleShippingSubmit = async (e: React.FormEvent) => {
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
            payment_status: 'pending',
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

      setOrderId(order.id);

      // Create payment intent via Supabase Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            amount: totalPrice,
            orderId: order.id,
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
      setCurrentStep('payment');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Creation Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update order status
      if (orderId) {
        await supabase
          .from('orders')
          .update({ 
            status: 'processing',
            payment_status: 'succeeded'
          })
          .eq('id', orderId);
      }

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });

      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Order Update Failed",
        description: "Payment succeeded but order update failed. Please contact support.",
        variant: "destructive",
      });
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
      <section className="py-20 md:py-32 bg-background min-h-screen">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${currentStep === 'shipping' ? 'text-gold' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-gold text-white' : 'bg-muted'}`}>
                      1
                    </div>
                    <span className="text-sm font-medium">Shipping</span>
                  </div>
                  <div className="w-12 h-px bg-border"></div>
                  <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-gold' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-gold text-white' : 'bg-muted'}`}>
                      2
                    </div>
                    <span className="text-sm font-medium">Payment</span>
                  </div>
                </div>
              </div>

              {currentStep === 'shipping' ? (
                <form onSubmit={handleShippingSubmit} className="space-y-8">
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

                    {/* Google Map */}
                    {googleMapsApiKey && googleMapsApiKey !== 'your_google_maps_api_key_here' && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-gold" />
                          <h3 className="text-sm font-medium text-foreground">Delivery Location</h3>
                        </div>
                        <div className="w-full h-64 rounded-lg overflow-hidden border border-border">
                          <APIProvider apiKey={googleMapsApiKey}>
                            <Map
                              center={mapCenter}
                              zoom={13}
                              gestureHandling="cooperative"
                              disableDefaultUI={false}
                            >
                              <Marker position={markerPosition} />
                            </Map>
                          </APIProvider>
                        </div>
                      </div>
                    )}
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
                        Creating Order...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-8">
                  {/* Payment */}
                  <div className="bg-card rounded-lg p-6 shadow-elegant">
                    <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold" />
                      Payment Details
                    </h2>
                    {clientSecret && stripePromise ? (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#C4A962',
                              colorBackground: '#ffffff',
                              colorText: '#1a1a1a',
                              colorDanger: '#8B1538',
                              fontFamily: 'system-ui, sans-serif',
                              borderRadius: '8px',
                            },
                          },
                        }}
                      >
                        <PaymentForm
                          totalAmount={totalPrice}
                          onSuccess={handlePaymentSuccess}
                          isProcessing={isProcessing}
                          setIsProcessing={setIsProcessing}
                        />
                      </Elements>
                    ) : (
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Loading payment form...</p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setCurrentStep('shipping')}
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Shipping
                  </Button>
                </div>
              )}
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
                      <div className="w-16 h-20 bg-gradient-to-br from-primary to-deep-blue-light rounded overflow-hidden shrink-0 relative">
                        {item.book.coverImage && item.book.coverImage !== '/placeholder.svg' ? (
                          <img 
                            src={item.book.coverImage} 
                            alt={item.book.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gold/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{item.quantity}x</span>
                        </div>
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
