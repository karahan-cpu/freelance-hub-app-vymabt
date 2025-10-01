
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  hourlyRate?: number; // Override client rate if needed
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  clientId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  hourlyRate: number;
  isRunning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  subtotal: number;
  tax: number;
  total: number;
  timeEntries: string[]; // Array of time entry IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalOutstanding: number;
  totalPaid: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  activeProjects: number;
  overdueInvoices: number;
}
