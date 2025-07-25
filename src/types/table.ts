export interface Table {
  id: string;
  name: string;
  capacity: number;
  position: {
    x: number;
    y: number;
  };
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TableFormData {
  name: string;
  capacity: number;
  position: {
    x: number;
    y: number;
  };
}

export interface TableWithGuests extends Table {
  guests: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
}