import axios, { AxiosInstance, AxiosError } from 'axios';
import { getToken } from './auth';
import { AuthResponse, SignupData, SigninData } from '@/types/user';
import { Task, TaskCreate, TaskUpdate, TasksResponse, TaskStatsResponse, FilterType, SortType } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async signup(data: SignupData): Promise<{ id: string; email: string; created_at: string; updated_at: string }> {
    const response = await this.client.post('/api/auth/signup', data);
    return response.data;
  }

  async signin(data: SigninData): Promise<AuthResponse> {
    const response = await this.client.post('/api/auth/signin', data);
    return response.data;
  }

  async getTasks(
    userId: string,
    filter?: FilterType,
    sort?: SortType,
    search?: string
  ): Promise<TasksResponse> {
    const params: any = {};
    if (filter && filter !== 'all') params.filter = filter;
    if (sort) params.sort = sort;
    if (search) params.search = search;

    const response = await this.client.get(`/api/users/${userId}/tasks`, { params });
    return response.data;
  }

  async getTask(userId: string, taskId: string): Promise<Task> {
    const response = await this.client.get(`/api/users/${userId}/tasks/${taskId}`);
    return response.data;
  }

  async createTask(userId: string, data: TaskCreate): Promise<Task> {
    const response = await this.client.post(`/api/users/${userId}/tasks`, data);
    return response.data;
  }

  async updateTask(userId: string, taskId: string, data: TaskUpdate): Promise<Task> {
    const response = await this.client.put(`/api/users/${userId}/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.client.delete(`/api/users/${userId}/tasks/${taskId}`);
  }

  async toggleTaskCompletion(userId: string, taskId: string): Promise<Task> {
    const response = await this.client.patch(`/api/users/${userId}/tasks/${taskId}/complete`);
    return response.data;
  }

  async getUpcomingTasks(userId: string): Promise<TasksResponse> {
    const response = await this.client.get(`/api/users/${userId}/tasks/upcoming`);
    return { tasks: response.data.tasks, total: response.data.count };
  }

  async getOverdueTasks(userId: string): Promise<TasksResponse> {
    const response = await this.client.get(`/api/users/${userId}/tasks/overdue`);
    return { tasks: response.data.tasks, total: response.data.count };
  }

  async getTaskStats(userId: string): Promise<TaskStatsResponse> {
    const response = await this.client.get(`/api/users/${userId}/tasks/stats`);
    return response.data;
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; created_at: string; updated_at: string }> {
    const response = await this.client.get(`/api/users/${userId}/profile`);
    return response.data;
  }

  async updateProfile(userId: string, data: { email: string; current_password: string }): Promise<{ id: string; email: string; created_at: string; updated_at: string }> {
    const response = await this.client.put(`/api/users/${userId}/profile`, data);
    return response.data;
  }

  async changePassword(userId: string, data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    const response = await this.client.put(`/api/users/${userId}/password`, data);
    return response.data;
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    await this.client.delete(`/api/users/${userId}`, { data: { password } });
  }

  async sendChatMessage(
    message: string,
    userId: string,
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<{ response: string; success: boolean; tool_calls?: any[] }> {
    const response = await this.client.post('/api/agent/chat', {
      message,
      user_id: userId,
      chat_history: chatHistory,
    });
    return response.data;
  }

  async clearChatHistory(userId: string): Promise<void> {
    await this.client.post('/api/agent/clear-history', { user_id: userId });
  }
}

export const api = new ApiClient();

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail: string }>;
    return axiosError.response?.data?.detail || axiosError.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
}
