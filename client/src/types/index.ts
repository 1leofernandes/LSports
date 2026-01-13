export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_id: number;
}

export interface Appointment {
  id: number;
  userId: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  court: string;
  status: string;
  paymentMethod?: string;
  user: User;
}

export interface Block {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  court: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
}