-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cover_image TEXT,
    year INTEGER NOT NULL CHECK (year > 0),
    pages INTEGER CHECK (pages > 0),
    language TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES public.books(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_year ON public.books(year);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON public.order_items(book_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Only admins can update is_admin field (handle this in app logic)

-- Books policies
-- Everyone can view books
CREATE POLICY "Books are viewable by everyone"
    ON public.books FOR SELECT
    USING (true);

-- Only admins can insert books
CREATE POLICY "Only admins can insert books"
    ON public.books FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can update books
CREATE POLICY "Only admins can update books"
    ON public.books FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can delete books
CREATE POLICY "Only admins can delete books"
    ON public.books FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Orders policies
-- Users can view their own orders, admins can view all
CREATE POLICY "Users can view own orders, admins view all"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders
CREATE POLICY "Only admins can update orders"
    ON public.orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Order items policies
-- Users can view their own order items, admins can view all
CREATE POLICY "Users can view own order items, admins view all"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM public.profiles
                     WHERE id = auth.uid() AND is_admin = true
                 )
            )
        )
    );

-- Authenticated users can create order items for their own orders
CREATE POLICY "Users can create order items for own orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Insert sample books (optional - you can remove this if you want to add books via admin panel)
INSERT INTO public.books (title, short_description, description, price, year, pages, language, stock) VALUES
(
    'Imihango n''Imigenzo n''Imiziririzo mu Rwanda',
    'A comprehensive study of Rwandan customs, traditions, and taboos.',
    'This seminal work by Bishop Aloys Bigirumwami explores the rich tapestry of Rwandan cultural traditions, customs, and taboos. Written with deep scholarly insight and pastoral sensitivity, the book serves as an invaluable resource for understanding pre-colonial Rwandan society and its spiritual foundations. It documents ceremonies, social norms, and the wisdom passed down through generations of Rwandans.',
    35.00,
    1964,
    280,
    'Kinyarwanda',
    50
),
(
    'Indirimbo z''Ubuhamya',
    'A collection of sacred hymns and spiritual songs.',
    'Bishop Bigirumwami''s collection of sacred hymns represents a beautiful fusion of Catholic liturgical tradition with Rwandan musical sensibilities. These hymns have been sung in churches across Rwanda for decades, touching the hearts of believers and enriching Catholic worship with authentic African expression. The collection includes songs for various liturgical seasons and sacramental celebrations.',
    25.00,
    1958,
    156,
    'Kinyarwanda',
    75
),
(
    'Inkuru y''Ubukristu mu Rwanda',
    'The history of Christianity in Rwanda.',
    'This historical account traces the arrival and development of Christianity in Rwanda, from the first missionaries to the establishment of the local Church. Bishop Bigirumwami provides firsthand insights as one of the key figures in Rwanda''s Catholic history, documenting the challenges, triumphs, and transformations of faith in the land of a thousand hills.',
    40.00,
    1971,
    320,
    'Kinyarwanda',
    30
),
(
    'Amasomo yo mu Bwiru',
    'Teachings from the sacred traditions.',
    'A profound exploration of traditional Rwandan wisdom and its intersection with Christian faith. Bishop Bigirumwami masterfully bridges the gap between indigenous spirituality and Catholic teaching, showing how the best of Rwandan tradition can be illuminated by the Gospel message. This work remains essential reading for understanding inculturation in African Christianity.',
    30.00,
    1966,
    210,
    'Kinyarwanda',
    40
),
(
    'Pastoral Letters Collection',
    'A compilation of pastoral letters to the faithful.',
    'Throughout his episcopate, Bishop Bigirumwami wrote numerous pastoral letters addressing the spiritual and social needs of his flock. This collection brings together his most significant letters, covering topics from faith formation to social justice, offering timeless guidance rooted in Gospel values and adapted to the Rwandan context.',
    28.00,
    1975,
    240,
    'Kinyarwanda/French',
    60
),
(
    'Igitabo cy''Amasengesho',
    'A prayer book for Rwandan Catholics.',
    'This beloved prayer book has been a companion to countless Rwandan Catholics in their spiritual journey. Bishop Bigirumwami compiled traditional Catholic prayers alongside original compositions that speak to the Rwandan heart. The book includes prayers for daily life, family devotions, and special occasions, all presented in beautiful Kinyarwanda.',
    18.00,
    1960,
    128,
    'Kinyarwanda',
    100
);

-- Create your first admin user (IMPORTANT: Run this AFTER you've created your account)
-- Replace 'your-email@example.com' with your actual email
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@example.com';
