import { supabase } from '../lib/supabase';
import type { BlogPost } from '../types';

export async function getPublishedBlogs(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function addBlog(payload: {
  title: string;
  excerpt: string;
  body: string;
  author: string;
  is_published: boolean;
}): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blogs')
    .insert({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function updateBlog(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blogs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function deleteBlog(id: string): Promise<void> {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}
