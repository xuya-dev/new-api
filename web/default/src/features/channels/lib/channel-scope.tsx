import React, { createContext, useContext } from 'react'
import type { Channel } from '../types'

export type QueryKeys = {
  all: readonly unknown[]
  lists: () => readonly unknown[]
  list: (params: Record<string, unknown>) => readonly unknown[]
  details: () => readonly unknown[]
  detail: (id: number) => readonly unknown[]
}

type ChannelListResponse = {
  success: boolean
  message?: string
  data?: {
    items: Channel[]
    total: number
    type_counts?: Record<string, number>
  }
}

export type ChannelScopeApi = {
  getChannels: (params?: Record<string, unknown>) => Promise<ChannelListResponse>
  searchChannels?: (params: Record<string, unknown>) => Promise<ChannelListResponse>
  getChannel: (id: number) => Promise<{
    success: boolean
    message?: string
    data?: Channel
  }>
  createChannel: (data: Record<string, unknown>) => Promise<{
    success: boolean
    message?: string
  }>
  updateChannel: (
    id: number,
    data: Partial<Channel>
  ) => Promise<{
    success: boolean
    message?: string
    data?: Channel
  }>
  deleteChannel: (id: number) => Promise<{
    success: boolean
    message?: string
  }>
  testChannel: (
    id: number,
    params?: Record<string, unknown>
  ) => Promise<{
    success: boolean
    message?: string
    error_code?: string
    data?: { response_time?: number; error?: string }
    time?: number
  }>
  updateChannelBalance?: (id: number) => Promise<{
    success: boolean
    message?: string
    balance?: number
    currency?: string
  }>
  copyChannel?: (
    id: number,
    params?: Record<string, unknown>
  ) => Promise<{
    success: boolean
    message?: string
    data?: { id: number }
  }>
  fetchUpstreamModels?: (id: number) => Promise<{
    success: boolean
    message?: string
    data?: string[]
  }>
  testAllChannels?: () => Promise<{ success: boolean; message?: string }>
  updateAllChannelsBalance?: () => Promise<{
    success: boolean
    message?: string
  }>
  fixChannelAbilities?: () => Promise<{
    success: boolean
    message?: string
    data?: { success: number; fails: number }
  }>
  deleteDisabledChannels?: () => Promise<{
    success: boolean
    message?: string
    data?: number
  }>
  batchDeleteChannels?: (data: {
    ids: number[]
  }) => Promise<{ success: boolean; message?: string; data?: number }>
  batchSetChannelTag?: (data: {
    ids: number[]
    tag: string | null
  }) => Promise<{ success: boolean; message?: string; data?: number }>
  enableTagChannels?: (
    tag: string
  ) => Promise<{ success: boolean; message?: string }>
  disableTagChannels?: (
    tag: string
  ) => Promise<{ success: boolean; message?: string }>
  editTagChannels?: (params: {
    tag: string
    new_tag?: string
    priority?: number
    weight?: number
    model_mapping?: string
    models?: string
    groups?: string
  }) => Promise<{ success: boolean; message?: string }>
  manageMultiKeys?: (params: Record<string, unknown>) => Promise<unknown>
  deleteOllamaModel?: (params: {
    channel_id: number
    model_name: string
  }) => Promise<{ success: boolean; message?: string }>
  getOllamaVersion?: (
    channelId: number
  ) => Promise<{
    success: boolean
    message?: string
    data?: { version: string }
  }>
  getGroups?: () => Promise<{
    success: boolean
    message?: string
    data?: string[]
  }>
  getAllModels?: () => Promise<{
    success: boolean
    message?: string
    data?: Array<{ id: string; [key: string]: unknown }>
  }>
  getPrefillGroups?: (
    type: 'model' | 'group'
  ) => Promise<{
    success: boolean
    message?: string
    data?: Array<{ id: number; name: string; items: string | string[] }>
  }>
}

export type ChannelFeatures = {
  tagMode: boolean
  idSort: boolean
  testAll: boolean
  updateAllBalances: boolean
  fixAbilities: boolean
  deleteAllDisabled: boolean
  upstreamUpdates: boolean
  copyChannel: boolean
  balanceQuery: boolean
  fetchModels: boolean
  ollamaModels: boolean
  multiKeyManage: boolean
  tagBatchEdit: boolean
  priorityWeight: boolean
  enableDisable: boolean
  batchOperations: boolean
  search: boolean
  modelFilter: boolean
  groupFilter: boolean
  typeFilter: boolean
  rewardColumn: boolean
}

export type ChannelScopeType = {
  api: ChannelScopeApi
  queryKeys: QueryKeys
  features: ChannelFeatures
}

const ChannelScopeContext = createContext<ChannelScopeType | null>(null)

export function ChannelScopeProvider({
  scope,
  children,
}: {
  scope: ChannelScopeType
  children: React.ReactNode
}) {
  return React.createElement(
    ChannelScopeContext.Provider,
    { value: scope },
    children
  )
}

export function useChannelScope(): ChannelScopeType {
  const scope = useContext(ChannelScopeContext)
  if (!scope) {
    throw new Error('useChannelScope must be used within ChannelScopeProvider')
  }
  return scope
}
