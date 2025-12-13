import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    shipping_address: '',
    shipping_city: '',
    shipping_country: '',
    shipping_postal_code: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          shipping_address: data.shipping_address || '',
          shipping_city: data.shipping_city || '',
          shipping_country: data.shipping_country || '',
          shipping_postal_code: data.shipping_postal_code || '',
        });
        setPreviewUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image must be less than 2MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let avatarUrl = formData.avatar_url;

      if (selectedFile) {
        setUploading(true);
        const uploadedUrl = await uploadAvatar(selectedFile);
        if (!uploadedUrl) {
          toast({
            title: 'Error',
            description: 'Failed to upload avatar',
            variant: 'destructive',
          });
          setSaving(false);
          setUploading(false);
          return;
        }
        avatarUrl = uploadedUrl;

        // Delete old avatar if exists
        if (formData.avatar_url) {
          const oldPath = formData.avatar_url.split('/user-avatars/')[1];
          if (oldPath) {
            await supabase.storage
              .from('user-avatars')
              .remove([`avatars/${oldPath}`]);
          }
        }
        setUploading(false);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          avatar_url: avatarUrl,
          shipping_address: formData.shipping_address,
          shipping_city: formData.shipping_city,
          shipping_country: formData.shipping_country,
          shipping_postal_code: formData.shipping_postal_code,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      setSelectedFile(null);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
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
            My <span className="text-gold">Profile</span>
          </h1>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-gold/20"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-deep-blue-light flex items-center justify-center border-4 border-gold/20">
                        <User className="w-16 h-16 text-gold/50" />
                      </div>
                    )}
                    {previewUrl && (
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                          setFormData({ ...formData, avatar_url: '' });
                        }}
                        className="absolute top-0 right-0 bg-destructive text-white rounded-full p-2 hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Max size: 2MB
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 space-y-6"
            >
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+250 XXX XXX XXX"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Default Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shipping_address">Street Address</Label>
                    <Input
                      id="shipping_address"
                      value={formData.shipping_address}
                      onChange={(e) =>
                        setFormData({ ...formData, shipping_address: e.target.value })
                      }
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping_city">City</Label>
                      <Input
                        id="shipping_city"
                        value={formData.shipping_city}
                        onChange={(e) =>
                          setFormData({ ...formData, shipping_city: e.target.value })
                        }
                        placeholder="Kigali"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping_postal_code">Postal Code</Label>
                      <Input
                        id="shipping_postal_code"
                        value={formData.shipping_postal_code}
                        onChange={(e) =>
                          setFormData({ ...formData, shipping_postal_code: e.target.value })
                        }
                        placeholder="00000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shipping_country">Country</Label>
                    <Input
                      id="shipping_country"
                      value={formData.shipping_country}
                      onChange={(e) =>
                        setFormData({ ...formData, shipping_country: e.target.value })
                      }
                      placeholder="Rwanda"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSave}
                disabled={saving || uploading}
              >
                {saving || uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
