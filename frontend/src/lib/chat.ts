import { api } from './api';

export async function sendChatMessage(
  message: string,
  userId: string,
  chatHistory: Array<{ role: string; content: string }> = []
): Promise<{ response: string; success: boolean; tool_calls?: any[] }> {
  try {
    return await api.sendChatMessage(message, userId, chatHistory);
  } catch (error: any) {
    console.error('Chat API error:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to send message to agent'
    );
  }
}

export async function clearChatHistory(userId: string): Promise<void> {
  try {
    await api.clearChatHistory(userId);
  } catch (error: any) {
    console.error('Failed to clear chat history:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to clear chat history'
    );
  }
}
