import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { studentSchema } from '@/lib/student-validation';
export const loadCampus = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, roles, records, interventions] = await Promise.all([
    context.supabase.from('profiles').select('*').eq('id', context.userId).single(),
    context.supabase.from('user_roles').select('role').eq('user_id', context.userId),
    context.supabase.from('student_records').select('*').order('id'),
    context.supabase.from('campus_interventions').select('*').order('created_at', { ascending: false }),
  ]);
  for (const r of [profile, roles, records, interventions]) if (r.error) throw new Error(r.error.message);
  return { profile: profile.data, roles: roles.data ?? [], records: records.data ?? [], interventions: interventions.data ?? [] };
});
export const saveCampusStudent = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ student: studentSchema, ownerId: z.string().uuid().nullable(), facultyId: z.string().uuid().nullable() })).handler(async ({ data, context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (roleError || !allowed) throw new Error('Only authorized administrators can save student records.');
  const { error } = await context.supabase.from('student_records').upsert({ id: data.student.id, owner_id: data.ownerId, faculty_id: data.facultyId, record: JSON.parse(JSON.stringify(data.student)) });
  if (error) throw new Error(error.message);
  return { saved: true };
});
export const saveCampusIntervention = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ studentId: z.string().min(1), reason: z.string().trim().min(5).max(1000), action: z.string().trim().min(5).max(1000), priority: z.enum(['low','medium','high']), owner: z.string().trim().min(1).max(100), followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('campus_interventions').insert({ student_id: data.studentId, created_by: context.userId, reason: data.reason, action: data.action, priority: data.priority, owner: data.owner, follow_up_date: data.followUpDate });
  if (error) throw new Error(error.message);
  return { saved: true };
});
export const changeCampusIntervention = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['open','in-progress','resolved']), outcome: z.string().max(2000) })).handler(async ({ data, context }) => {
  const { data: changed, error } = await context.supabase.from('campus_interventions').update({ status: data.status, outcome: data.outcome }).eq('id', data.id).select('id');
  if (error) throw new Error(error.message);
  if (!changed?.length) throw new Error('This intervention is not available for you to update.');
  return { saved: true };
});
