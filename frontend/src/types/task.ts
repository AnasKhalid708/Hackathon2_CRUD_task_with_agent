export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  deadline?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  deadline?: string | null;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}

export interface TaskStatsResponse {
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  due_today: number;
  upcoming_24h: number;
  no_deadline: number;
}

export type FilterType = 'all' | 'complete' | 'incomplete' | 'overdue' | 'upcoming' | 'no-deadline';
export type SortType = 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc' | 'status' | 'deadline_asc' | 'deadline_desc';
