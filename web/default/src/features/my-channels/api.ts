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

async function createUserChannel(
  data: Record<string, unknown>
) {
  const channelData =
    'channel' in data && typeof data.channel === 'object' && data.channel !== null
      ? (data.channel as Record<string, unknown>)
      : data
  const res = await api.post('/api/user/channel', channelData)
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

async function batchDeleteUserChannels(data: {
  ids: number[]
}): Promise<{ success: boolean; message?: string; data?: number }> {
  let deleted = 0
  for (const id of data.ids) {
    const res = await api.delete(`/api/user/channel/${id}`)
    if (res.data?.success) deleted++
  }
  return { success: true, data: deleted }
}

async function batchSetUserChannelTag(data: {
  ids: number[]
  tag: string | null
}): Promise<{ success: boolean; message?: string; data?: number }> {
  let updated = 0
  for (const id of data.ids) {
    const res = await api.put(`/api/user/channel/${id}`, {
      tag: data.tag ?? '',
    })
    if (res.data?.success) updated++
  }
  return { success: true, data: updated }
}

async function getUserAllModels() {
  const res = await api.get('/api/user/channel/models')
  return res.data as {
    success: boolean
    message?: string
    data?: Array<{ id: string; [key: string]: unknown }>
  }
}

async function fetchUserModels(data: {
  base_url: string
  type: number
  key: string
}) {
  const res = await api.post('/api/user/channel/fetch_models', data)
  return res.data as {
    success: boolean
    message?: string
    data?: string[]
  }
}

async function getUserPrefillGroups(
  type: 'model' | 'group' = 'model'
) {
  const res = await api.get('/api/prefill_group', { params: { type } })
  return res.data as {
    success: boolean
    message?: string
    data?: Array<{ id: number; name: string; items: string | string[] }>
  }
}

async function getUserGroups() {
  const res = await api.get('/api/group/')
  return res.data as {
    success: boolean
    message?: string
    data?: string[]
  }
}

async function updateUserChannelBalance(id: number) {
  const res = await api.get(`/api/user/channel/update_balance/${id}`)
  return res.data as {
    success: boolean
    message?: string
    balance?: number
    currency?: string
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
    updateChannelBalance: updateUserChannelBalance,
    batchDeleteChannels: batchDeleteUserChannels,
    batchSetChannelTag: batchSetUserChannelTag,
    getAllModels: getUserAllModels,
    getPrefillGroups: getUserPrefillGroups,
    getGroups: getUserGroups,
    fetchModels: fetchUserModels,
  },
  queryKeys: myChannelsQueryKeys,
  features: {
    tagMode: false,
    idSort: true,
    testAll: false,
    updateAllBalances: false,
    fixAbilities: false,
    deleteAllDisabled: false,
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
    rewardColumn: true,
  },
}
