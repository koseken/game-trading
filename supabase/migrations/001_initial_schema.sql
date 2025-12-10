-- ================================================================
-- Game Trading Platform - Initial Database Schema
-- ================================================================
-- This migration sets up the complete database schema for the game trading MVP
-- including tables, indexes, RLS policies, triggers, and seed data.

-- ================================================================
-- EXTENSIONS
-- ================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    rating_avg DECIMAL(2,1) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on username for search
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Add comment
COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';

-- ----------------------------------------------------------------
-- 2. GAME CATEGORIES TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on slug for lookups
CREATE INDEX idx_game_categories_slug ON public.game_categories(slug);

COMMENT ON TABLE public.game_categories IS 'Categories for different games';

-- ----------------------------------------------------------------
-- 3. LISTINGS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.game_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 100 AND price <= 1000000),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'cancelled')),
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_price ON public.listings(price);

COMMENT ON TABLE public.listings IS 'Game item listings from sellers';

-- ----------------------------------------------------------------
-- 4. TRANSACTIONS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Create indexes for foreign keys and queries
CREATE INDEX idx_transactions_listing_id ON public.transactions(listing_id);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Add constraint to prevent buyer from being the seller
ALTER TABLE public.transactions ADD CONSTRAINT chk_buyer_not_seller CHECK (buyer_id != seller_id);

COMMENT ON TABLE public.transactions IS 'Transactions between buyers and sellers';

-- ----------------------------------------------------------------
-- 5. MESSAGES TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for queries
CREATE INDEX idx_messages_transaction_id ON public.messages(transaction_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

COMMENT ON TABLE public.messages IS 'Chat messages within transactions';

-- ----------------------------------------------------------------
-- 6. REVIEWS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(transaction_id, reviewer_id)
);

-- Create indexes for queries
CREATE INDEX idx_reviews_transaction_id ON public.reviews(transaction_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Add constraint to prevent self-review
ALTER TABLE public.reviews ADD CONSTRAINT chk_reviewer_not_reviewee CHECK (reviewer_id != reviewee_id);

COMMENT ON TABLE public.reviews IS 'User reviews after transaction completion';

-- ================================================================
-- TRIGGERS
-- ================================================================

-- ----------------------------------------------------------------
-- Trigger: Update updated_at timestamp
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to listings table
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------
-- Trigger: Auto-create user profile on auth signup
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- Trigger: Update user rating when review is created
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reviewee's rating average and count
    UPDATE public.users
    SET
        rating_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        rating_avg = (
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM public.reviews
            WHERE reviewee_id = NEW.reviewee_id
        )
    WHERE id = NEW.reviewee_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_rating();

-- Also update when review is updated or deleted
CREATE TRIGGER on_review_updated
    AFTER UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_rating();

CREATE OR REPLACE FUNCTION public.update_user_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reviewee's rating average and count after deletion
    UPDATE public.users
    SET
        rating_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE reviewee_id = OLD.reviewee_id
        ),
        rating_avg = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM public.reviews
            WHERE reviewee_id = OLD.reviewee_id
        ), 0)
    WHERE id = OLD.reviewee_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_deleted
    AFTER DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_rating_on_delete();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- USERS TABLE POLICIES
-- ----------------------------------------------------------------

-- Anyone can view user profiles (for public listings)
CREATE POLICY "Users are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but allow for manual insert)
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------
-- GAME CATEGORIES POLICIES
-- ----------------------------------------------------------------

-- Anyone can view categories
CREATE POLICY "Categories are viewable by everyone"
    ON public.game_categories FOR SELECT
    USING (true);

-- Only admins can insert categories
CREATE POLICY "Only admins can insert categories"
    ON public.game_categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can update categories
CREATE POLICY "Only admins can update categories"
    ON public.game_categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories"
    ON public.game_categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ----------------------------------------------------------------
-- LISTINGS TABLE POLICIES
-- ----------------------------------------------------------------

-- Anyone can view active listings
CREATE POLICY "Active listings are viewable by everyone"
    ON public.listings FOR SELECT
    USING (
        status = 'active'
        OR seller_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.transactions
            WHERE listing_id = listings.id
            AND buyer_id = auth.uid()
        )
    );

-- Authenticated users can create listings
CREATE POLICY "Authenticated users can create listings"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = seller_id);

-- Users can delete their own listings (if not sold)
CREATE POLICY "Users can delete own listings"
    ON public.listings FOR DELETE
    USING (auth.uid() = seller_id AND status != 'sold');

-- ----------------------------------------------------------------
-- TRANSACTIONS TABLE POLICIES
-- ----------------------------------------------------------------

-- Users can view transactions they're involved in
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
    );

-- Authenticated users can create transactions
CREATE POLICY "Authenticated users can create transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Buyers and sellers can update transaction status
CREATE POLICY "Participants can update transactions"
    ON public.transactions FOR UPDATE
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
    );

-- ----------------------------------------------------------------
-- MESSAGES TABLE POLICIES
-- ----------------------------------------------------------------

-- Users can view messages in their transactions
CREATE POLICY "Users can view messages in own transactions"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions
            WHERE id = messages.transaction_id
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users can send messages in their transactions
CREATE POLICY "Users can send messages in own transactions"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.transactions
            WHERE id = transaction_id
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- ----------------------------------------------------------------
-- REVIEWS TABLE POLICIES
-- ----------------------------------------------------------------

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

-- Users can create reviews for completed transactions they participated in
CREATE POLICY "Users can create reviews for own transactions"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND EXISTS (
            SELECT 1 FROM public.transactions
            WHERE id = transaction_id
            AND status = 'completed'
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
            AND (
                (buyer_id = auth.uid() AND seller_id = reviewee_id)
                OR (seller_id = auth.uid() AND buyer_id = reviewee_id)
            )
        )
    );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = reviewer_id);

-- ================================================================
-- SEED DATA
-- ================================================================

-- Insert popular game categories
INSERT INTO public.game_categories (name, slug, image_url) VALUES
    ('Genshin Impact', 'genshin-impact', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'),
    ('Pokemon', 'pokemon', 'https://images.unsplash.com/photo-1542779283-429940ce8336?w=400'),
    ('Final Fantasy XIV', 'final-fantasy-xiv', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'),
    ('League of Legends', 'league-of-legends', 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400'),
    ('World of Warcraft', 'world-of-warcraft', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'),
    ('Counter-Strike 2', 'counter-strike-2', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'),
    ('Dota 2', 'dota-2', 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400'),
    ('Valorant', 'valorant', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400'),
    ('Roblox', 'roblox', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'),
    ('Minecraft', 'minecraft', 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=400'),
    ('Fortnite', 'fortnite', 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400'),
    ('Apex Legends', 'apex-legends', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400'),
    ('FIFA/EA FC', 'fifa-ea-fc', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400'),
    ('Call of Duty', 'call-of-duty', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'),
    ('Honkai: Star Rail', 'honkai-star-rail', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'),
    ('Lost Ark', 'lost-ark', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'),
    ('Diablo IV', 'diablo-iv', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400'),
    ('Path of Exile', 'path-of-exile', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'),
    ('Rocket League', 'rocket-league', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400'),
    ('Other', 'other', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400')
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- HELPFUL VIEWS (Optional)
-- ================================================================

-- View for active listings with seller info
CREATE OR REPLACE VIEW public.listings_with_seller AS
SELECT
    l.*,
    u.username as seller_username,
    u.avatar_url as seller_avatar_url,
    u.rating_avg as seller_rating,
    u.rating_count as seller_rating_count,
    gc.name as category_name,
    gc.slug as category_slug
FROM public.listings l
JOIN public.users u ON l.seller_id = u.id
LEFT JOIN public.game_categories gc ON l.category_id = gc.id;

-- View for user transaction history
CREATE OR REPLACE VIEW public.user_transactions AS
SELECT
    t.*,
    l.title as listing_title,
    l.price as listing_price,
    buyer.username as buyer_username,
    buyer.avatar_url as buyer_avatar_url,
    seller.username as seller_username,
    seller.avatar_url as seller_avatar_url
FROM public.transactions t
JOIN public.listings l ON t.listing_id = l.id
JOIN public.users buyer ON t.buyer_id = buyer.id
JOIN public.users seller ON t.seller_id = seller.id;

-- ================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ================================================================

-- Function to get user's active listings count
CREATE OR REPLACE FUNCTION public.get_user_active_listings_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.listings
        WHERE seller_id = user_id AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's completed transactions count
CREATE OR REPLACE FUNCTION public.get_user_completed_transactions_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.transactions
        WHERE (buyer_id = user_id OR seller_id = user_id)
        AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_listings_category_status ON public.listings(category_id, status) WHERE status = 'active';
CREATE INDEX idx_listings_seller_status ON public.listings(seller_id, status);
CREATE INDEX idx_transactions_buyer_status ON public.transactions(buyer_id, status);
CREATE INDEX idx_transactions_seller_status ON public.transactions(seller_id, status);

-- Full text search index for listings (optional, for future search feature)
CREATE INDEX idx_listings_search ON public.listings USING gin(to_tsvector('english', title || ' ' || description));

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ================================================================
-- END OF MIGRATION
-- ================================================================
