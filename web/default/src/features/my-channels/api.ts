import { api } from '@/lib/api'
import type { Channel } from '@/features/channels/types'
import type { ChannelScopeType } from '@/features/channels/lib/channel-scope'

export const myChannelsQueryKeys = {
  all: ['my-channels'] as const,
  lists: () => [...myChannelsQueryKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...myChannelsQueryKeys.lists(), params] as const,
  details: () => [...myChannelsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...myChannelsQueryKeys.details(), id] as const,
}

async function getUserChannels(params?: Record<string, unknown>) {
  const res = await api.get('/api/user/channel', { params })
  return res.data as {
    success: boolean
    message?: string
    data?: { items: Channel[]; total: number }
  }
}

async function getUserChannel(id: number) {
  const res = await api.get(`/api/user/channel/${id}`)
  return res.data as {
    success: boolean
    message?: string
    data?: Channel
  }
}

async function createUserChannel(data: Record<string, unknown>) {
  const res = await api.post('/api/user/channel', data)
  return res.data as { success: boolean; message?: string }
}

async function updateUserChannel(id: number, data: Partial<Channel>) {
  const res = await api.put(`/api/user/channel/${id}`, data)
  return res.data as {
    success: boolean
    message?: string
    data?: Channel
  }
}

async function deleteUserChannel(id: number) {
  const res = await api.delete(`/api/user/channel/${id}`)
  return res.data as { success: boolean; message?: string }
}

async function testUserChannel(
  id: number,
  params?: Record<string, unknown>
) {
  const res = await api.get(`/api/user/channel/test/${id}`, { params })
  return res.data as {
    success: boolean
    message?: string
    error_code?: string
    time?: number
    data?: { response_time?: number; error?: string }
  }
}

export const userChannelScope: ChannelScopeType = {
  api: {
    getChannels: getUserChannels,
    getChannel: getUserChannel,
    createChannel: createUserChannel,
    updateChannel: updateUserChannel,
    deleteChannel: deleteUserChannel,
    testChannel: testUserChannel,
  },
  queryKeys: myChannelsQueryKeys,
  features: {
    tagMode: false,
    idSort: true,
    testAll: true,
    updateAllBalances: true,
    fixAbilities: true,
    deleteAllDisabled: true,
    upstreamUpdates: false,
    copyChannel: false,
    balanceQuery: true,
    fetchModels: true,
    ollamaModels: false,
    multiKeyManage: true,
    tagBatchEdit: false,
    priorityWeight: false,
    enableDisable: true,
    batchOperations: true,
    search: true,
    modelFilter: true,
    groupFilter: false,
    typeFilter: true,
  },
}
