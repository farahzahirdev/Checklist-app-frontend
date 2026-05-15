import { apiGetWithAuth, apiPatch } from '@/lib/api';

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  job_title: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateAdminProfilePayload = {
  email?: string;
  full_name?: string;
  username?: string;
  job_title?: string;
  department?: string;
};

export type ChangeAdminPasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export function getAdminProfile() {
  return apiGetWithAuth<AdminProfile>('/admin/profile');
}

export function updateAdminProfile(payload: UpdateAdminProfilePayload) {
  return apiPatch<AdminProfile, UpdateAdminProfilePayload>('/admin/profile', payload);
}

export function changeAdminPassword(payload: ChangeAdminPasswordPayload) {
  return apiPatch<Record<string, unknown>, ChangeAdminPasswordPayload>('/admin/profile/password', payload);
}
