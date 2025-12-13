import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalBooks: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalBooks: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      // Fetch books count
      const { count: booksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalOrders: orders?.length || 0,
        totalBooks: booksCount || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">
          Admin <span className="text-gold">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          Overview of your bookstore statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:border-gold transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Manage Users</p>
            </a>
            <a
              href="/admin/orders"
              className="p-4 border rounded-lg hover:border-gold transition-colors text-center"
            >
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">View Orders</p>
            </a>
            <a
              href="/admin/books"
              className="p-4 border rounded-lg hover:border-gold transition-colors text-center"
            >
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Manage Books</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
