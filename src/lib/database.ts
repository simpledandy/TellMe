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
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Problem operations
export async function getProblems(options: {
  userId?: string;
  categoryId?: string;
  status?: Problem['status'];
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('problems')
    .select(`
      *,
      categories:category_id (name)
    `);

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

  query = query.order('created_at', { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq('problem_id', problemId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
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