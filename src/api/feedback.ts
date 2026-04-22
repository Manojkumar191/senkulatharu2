import { supabase } from '../lib/supabase';
import type { Feedback } from '../types';

export async function getApprovedFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Feedback[];
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Feedback[];
}

export async function submitFeedback(payload: {
  customer_name: string;
  city_state: string;
  review_text: string;
  rating: number;
}): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      ...payload,
      is_approved: false,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Feedback;
}

export async function setFeedbackApproved(id: string, isApproved: boolean): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .update({
      is_approved: isApproved,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Feedback;
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) throw error;
}
