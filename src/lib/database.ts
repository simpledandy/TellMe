import { supabase } from '~/utils/supabase';
import { Database } from '~/src/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Problem = Database['public']['Tables']['problems']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type ProblemCategory = Database['public']['Tables']['problem_categories']['Row'];
export type ProblemTag = Database['public']['Tables']['problem_tags']['Row'];
export type ProblemSuggestion = Database['public']['Tables']['problem_suggestions']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Profile operations
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    // First try to get the existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If the error is "no rows returned", create a new profile
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: `user_${userId.slice(0, 8)}`, // Generate a temporary username
            reputation: 0,
            interests: [], // Initialize empty interests array
            skills: [], // Initialize empty skills array
            social_links: {} // Initialize empty social links object
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }

        return newProfile;
      }
      
      console.error('Error fetching profile:', error);
      return null;
    }

    // Ensure interests is always an array
    if (data) {
      if (typeof data.interests === 'string') {
        data.interests = [data.interests];
      } else if (!Array.isArray(data.interests)) {
        data.interests = [];
      }
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Problem operations
export async function getProblems(options: {
  userId?: string;
  categoryId?: string;
  status?: 'open' | 'solved' | 'closed';
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  problemId?: string;
}) {
  try {
    let query = supabase
      .from('problems')
      .select(`
        *,
        categories:problem_categories(name)
      `);

    if (options.problemId) {
      query = query.eq('id', options.problemId);
    } else {
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.isPublic !== undefined) {
        query = query.eq('is_public', options.isPublic);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
    }

    const { data: problems, error } = await query;

    if (error) {
      throw error;
    }

    // Get all unique user IDs from the problems
    const userIds = [...new Set(problems.map(problem => problem.user_id))];

    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      throw profilesError;
    }

    // Transform the data to match the expected structure
    return problems.map(problem => ({
      ...problem,
      user: {
        id: problem.user_id,
        profiles: profiles?.find(p => p.id === problem.user_id) || null
      }
    }));
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
}

export async function createProblem(problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('problems')
    .insert(problem)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProblem(problemId: string, updates: Partial<Problem>) {
  const { data, error } = await supabase
    .from('problems')
    .update(updates)
    .eq('id', problemId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProblem(problemId: string) {
  const { error } = await supabase
    .from('problems')
    .delete()
    .eq('id', problemId);
  
  if (error) throw error;
}

// Comment operations
export async function getComments(problemId: string) {
  // First, get the comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('problem_id', problemId)
    .order('created_at', { ascending: true });
  
  if (commentsError) throw commentsError;
  if (!comments) return [];

  // Then, get the profiles for all users who commented
  const userIds = [...new Set(comments.map(comment => comment.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  // Combine the data
  return comments.map(comment => ({
    ...comment,
    user: {
      id: comment.user_id,
      profiles: profiles?.find(p => p.id === comment.user_id) || null
    }
  }));
}

export async function createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Bookmark operations
export async function toggleBookmark(userId: string, problemId: string) {
  const { data: existing } = await supabase
    .from('problem_bookmarks')
    .select()
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('problem_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('problem_id', problemId);
    
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('problem_bookmarks')
      .insert({ user_id: userId, problem_id: problemId });
    
    if (error) throw error;
    return true;
  }
}

export async function getBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('problem_bookmarks')
    .select(`
      problems:problem_id (
        *,
        profiles:user_id (username, avatar_url),
        categories:category_id (name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data.map(item => item.problems);
}

// Notification operations
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  
  if (error) throw error;
}

// Suggestion operations
export async function createSuggestion(suggestion: Omit<ProblemSuggestion, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('problem_suggestions')
    .insert(suggestion)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSuggestionStatus(suggestionId: string, status: ProblemSuggestion['status']) {
  const { data, error } = await supabase
    .from('problem_suggestions')
    .update({ status })
    .eq('id', suggestionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Category operations
export async function getCategories() {
  const { data, error } = await supabase
    .from('problem_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

// Tag operations
export async function getTags() {
  const { data, error } = await supabase
    .from('problem_tags')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function addTagsToProblem(problemId: string, tagIds: string[]) {
  const { error } = await supabase
    .from('problem_tag_relations')
    .insert(tagIds.map(tagId => ({
      problem_id: problemId,
      tag_id: tagId
    })));
  
  if (error) throw error;
}

export async function removeTagsFromProblem(problemId: string, tagIds: string[]) {
  const { error } = await supabase
    .from('problem_tag_relations')
    .delete()
    .eq('problem_id', problemId)
    .in('tag_id', tagIds);
  
  if (error) throw error;
} 