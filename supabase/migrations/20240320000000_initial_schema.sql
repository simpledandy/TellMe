-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.problem_reports CASCADE;
DROP TABLE IF EXISTS public.problem_suggestions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.problem_bookmarks CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.problem_tag_relations CASCADE;
DROP TABLE IF EXISTS public.problem_tags CASCADE;
DROP TABLE IF EXISTS public.problems CASCADE;
DROP TABLE IF EXISTS public.problem_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    reputation INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create problem_categories table
CREATE TABLE public.problem_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create problems table
CREATE TABLE public.problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.problem_categories(id),
    status TEXT NOT NULL CHECK (status IN ('open', 'solved', 'closed')) DEFAULT 'open',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    solved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create problem_tags table
CREATE TABLE public.problem_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create problem_tag_relations table
CREATE TABLE public.problem_tag_relations (
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.problem_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create problem_bookmarks table
CREATE TABLE public.problem_bookmarks (
    user_id UUID NOT NULL,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, problem_id),
    CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create problem_suggestions table
CREATE TABLE public.problem_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_suggestion_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create problem_reports table
CREATE TABLE public.problem_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_report_user FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Problem Categories
CREATE POLICY "Categories are viewable by everyone"
    ON public.problem_categories FOR SELECT
    USING (true);

-- Problems
CREATE POLICY "Public problems are viewable by everyone"
    ON public.problems FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create problems"
    ON public.problems FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problems"
    ON public.problems FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own problems"
    ON public.problems FOR DELETE
    USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON public.problem_bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
    ON public.problem_bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Problem Suggestions
CREATE POLICY "Suggestions are viewable by problem owners"
    ON public.problem_suggestions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.problems
        WHERE problems.id = problem_suggestions.problem_id
        AND problems.user_id = auth.uid()
    ));

CREATE POLICY "Users can create suggestions"
    ON public.problem_suggestions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
    ON public.problem_suggestions FOR UPDATE
    USING (auth.uid() = user_id);

-- Problem Reports
CREATE POLICY "Reports are viewable by admins only"
    ON public.problem_reports FOR SELECT
    USING (false); -- You'll need to implement admin role checking

CREATE POLICY "Users can create reports"
    ON public.problem_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own reports"
    ON public.problem_reports FOR UPDATE
    USING (auth.uid() = reporter_id);

-- Insert some initial categories
INSERT INTO public.problem_categories (name, description) VALUES
    ('General', 'General problems and questions'),
    ('Technical', 'Technical issues and bugs'),
    ('Feature Request', 'Suggestions for new features'),
    ('Documentation', 'Documentation related issues'),
    ('Performance', 'Performance related problems')
ON CONFLICT (name) DO NOTHING; 