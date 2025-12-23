
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export type EntryType = '5H' | '8H' | 'CUSTOM' | 'EXPENSE' | 'PAYMENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  hourlyRate: number;
  avatar?: string;
}

export interface PuantajEntry {
  id: string;
  userId: string;
  type: EntryType;
  amount: number;
  date: string;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'sick';
  entryTime?: string;
  exitTime?: string;
  overtime?: number;
  notes?: string;
}

export interface AppState {
  users: User[];
  entries: PuantajEntry[];
  currentUser: User | null;
}
