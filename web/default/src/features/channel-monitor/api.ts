import { api } from '@/lib/api'

export interface MonitorChannel {
  id: number
  name: string
  type: number
  status: number
  response_time: number
  test_time: number
  balance: number
  group: string
  user_id: number
  models: string
}

export interface MonitorLog {
  id: number
  channel_id: number
  status: number
  response_time: number
  error_msg: string
  tested_at: number
}

export interface HourlyStatus {
  hour: number
  status: number
  success: number
  total: number
  avg_time: number
}

export interface MonitorDetailResponse {
  channel: MonitorChannel
  logs: MonitorLog[]
  hourly_stats: HourlyStatus[]
}

export async function getChannelMonitor() {
  const res = await api.get('/api/monitor')
  return res.data
}

export async function getChannelMonitorDetail(id: number, limit?: number) {
  const res = await api.get(`/api/monitor/${id}`, { params: { limit } })
  return res.data
}
