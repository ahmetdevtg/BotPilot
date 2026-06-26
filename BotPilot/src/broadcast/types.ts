export interface BroadcastResult {
  success: number;
  failed: number;
}

export interface BroadcastRecord {
  id: number;
  bot_id: number;
  message: string;
  success_count: number;
  failed_count: number;
  created_at: string;
}