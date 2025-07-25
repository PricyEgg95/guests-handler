export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  status: 'no-response' | 'accepted' | 'declined';
  table_number?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type GuestStatus = Guest['status'];

export interface GuestFormData {
  first_name: string;
  last_name: string;
  status: GuestStatus;
  table_number?: string | null;
}