-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.problem_categories;
DROP POLICY IF EXISTS "Public problems are viewable by everyone" ON public.problems;
DROP POLICY IF EXISTS "Users can create problems" ON public.problems;
DROP POLICY IF EXISTS "Users can update their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can delete their own problems" ON public.problems;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.problem_bookmarks;
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.problem_bookmarks;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Suggestions are viewable by problem owners" ON public.problem_suggestions;
DROP POLICY IF EXISTS "Users can create suggestions" ON public.problem_suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.problem_suggestions;
DROP POLICY IF EXISTS "Reports are viewable by admins only" ON public.problem_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.problem_reports;

-- Update profiles table schema
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Create new policies with better security

-- Profiles policies
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "profiles_insert_policy"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Problem Categories policies
CREATE POLICY "categories_select_policy"
    ON public.problem_categories FOR SELECT
    USING (true);

CREATE POLICY "categories_insert_policy"
    ON public.problem_categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categories_update_policy"
    ON public.problem_categories FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Problems policies
CREATE POLICY "problems_select_policy"
    ON public.problems FOR SELECT
    USING (
        is_public = true 
        OR auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.comments 
            WHERE comments.problem_id = problems.id 
            AND comments.user_id = auth.uid()
        )
    );

CREATE POLICY "problems_insert_policy"
    ON public.problems FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "problems_update_policy"
    ON public.problems FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "problems_delete_policy"
    ON public.problems FOR DELETE
    USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "comments_select_policy"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = comments.problem_id
            AND (problems.is_public = true OR problems.user_id = auth.uid())
        )
    );

CREATE POLICY "comments_insert_policy"
    ON public.comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = problem_id
            AND (problems.is_public = true OR problems.user_id = auth.uid())
        )
    );

CREATE POLICY "comments_update_policy"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_policy"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "bookmarks_select_policy"
    ON public.problem_bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_policy"
    ON public.problem_bookmarks FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = problem_id
            AND (problems.is_public = true OR problems.user_id = auth.uid())
        )
    );

CREATE POLICY "bookmarks_delete_policy"
    ON public.problem_bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "notifications_select_policy"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Problem Suggestions policies
CREATE POLICY "suggestions_select_policy"
    ON public.problem_suggestions FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = problem_suggestions.problem_id
            AND problems.user_id = auth.uid()
        )
    );

CREATE POLICY "suggestions_insert_policy"
    ON public.problem_suggestions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = problem_id
            AND problems.user_id != auth.uid()
        )
    );

CREATE POLICY "suggestions_update_policy"
    ON public.problem_suggestions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Problem Reports policies
CREATE POLICY "reports_select_policy"
    ON public.problem_reports FOR SELECT
    USING (
        auth.uid() = reporter_id
        OR EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = problem_reports.problem_id
            AND problems.user_id = auth.uid()
        )
    );

CREATE POLICY "reports_insert_policy"
    ON public.problem_reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id
        AND EXISTS (
            SELECT 1 FROM public.problems
            WHERE problems.id = problem_id
            AND problems.user_id != auth.uid()
        )
    );

CREATE POLICY "reports_update_policy"
    ON public.problem_reports FOR UPDATE
    USING (auth.uid() = reporter_id)
    WITH CHECK (auth.uid() = reporter_id); 