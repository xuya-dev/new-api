import type { QueryClient } from '@tanstack/react-query'
import i18next from 'i18next'
import { toast } from 'sonner'
import { formatCurrencyFromUSD } from '@/lib/currency'
import {
  copyChannel as _copyChannel,
  deleteChannel as _deleteChannel,
  testChannel as _testChannel,
  updateChannel as _updateChannel,
  batchDeleteChannels as _batchDeleteChannels,
  batchSetChannelTag as _batchSetChannelTag,
  enableTagChannels as _enableTagChannels,
  disableTagChannels as _disableTagChannels,
  deleteDisabledChannels as _deleteDisabledChannels,
  fixChannelAbilities as _fixChannelAbilities,
  editTagChannels as _editTagChannels,
  testAllChannels as _testAllChannels,
  updateAllChannelsBalance as _updateAllChannelsBalance,
  updateChannelBalance as _updateChannelBalance,
} from '../api'
import { CHANNEL_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import type { ChannelScopeType } from './channel-scope'
import type { CopyChannelParams } from '../types'

export const channelsQueryKeys = {
  all: ['channels'] as const,
  lists: () => [...channelsQueryKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...channelsQueryKeys.lists(), params] as const,
  details: () => [...channelsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...channelsQueryKeys.details(), id] as const,
}

type ScopeRef = ChannelScopeType | undefined | null

function getUpdateChannel(scope: ScopeRef) {
  return scope?.api.updateChannel ?? _updateChannel
}
function getDeleteChannel(scope: ScopeRef) {
  return scope?.api.deleteChannel ?? _deleteChannel
}
function getTestChannel(scope: ScopeRef) {
  return scope?.api.testChannel ?? _testChannel
}
function getCopyChannel(scope: ScopeRef) {
  return scope?.api.copyChannel ?? _copyChannel
}
function getUpdateChannelBalance(scope: ScopeRef) {
  return scope?.api.updateChannelBalance ?? _updateChannelBalance
}
function getBatchDeleteChannels(scope: ScopeRef) {
  return scope?.api.batchDeleteChannels ?? _batchDeleteChannels
}
function getBatchSetChannelTag(scope: ScopeRef) {
  return scope?.api.batchSetChannelTag ?? _batchSetChannelTag
}
function getEnableTagChannels(scope: ScopeRef) {
  return scope?.api.enableTagChannels ?? _enableTagChannels
}
function getDisableTagChannels(scope: ScopeRef) {
  return scope?.api.disableTagChannels ?? _disableTagChannels
}
function getEditTagChannels(scope: ScopeRef) {
  return scope?.api.editTagChannels ?? _editTagChannels
}
function getDeleteDisabledChannels(scope: ScopeRef) {
  return scope?.api.deleteDisabledChannels ?? _deleteDisabledChannels
}
function getFixChannelAbilities(scope: ScopeRef) {
  return scope?.api.fixChannelAbilities ?? _fixChannelAbilities
}
function getTestAllChannels(scope: ScopeRef) {
  return scope?.api.testAllChannels ?? _testAllChannels
}
function getUpdateAllChannelsBalance(scope: ScopeRef) {
  return scope?.api.updateAllChannelsBalance ?? _updateAllChannelsBalance
}
function getQueryKeys(scope: ScopeRef) {
  return scope?.queryKeys ?? channelsQueryKeys
}

export async function handleEnableChannel(
  id: number,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getUpdateChannel(scope)(id, {
      status: CHANNEL_STATUS.ENABLED,
    })
    if (response.success) {
      toast.success(i18next.t(SUCCESS_MESSAGES.ENABLED))
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }
  } catch (_error) {
    toast.error(i18next.t(ERROR_MESSAGES.UPDATE_FAILED))
  }
}

export async function handleDisableChannel(
  id: number,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getUpdateChannel(scope)(id, {
      status: CHANNEL_STATUS.MANUAL_DISABLED,
    })
    if (response.success) {
      toast.success(i18next.t(SUCCESS_MESSAGES.DISABLED))
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }
  } catch (_error) {
    toast.error(i18next.t(ERROR_MESSAGES.UPDATE_FAILED))
  }
}

export async function handleToggleChannelStatus(
  id: number,
  currentStatus: number,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  if (currentStatus === CHANNEL_STATUS.ENABLED) {
    await handleDisableChannel(id, queryClient, onSuccess, scope)
  } else {
    await handleEnableChannel(id, queryClient, onSuccess, scope)
  }
}

export async function handleDeleteChannel(
  id: number,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getDeleteChannel(scope)(id)
    if (response.success) {
      toast.success(i18next.t(SUCCESS_MESSAGES.DELETED))
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }
  } catch (_error) {
    toast.error(i18next.t(ERROR_MESSAGES.DELETE_FAILED))
  }
}

export async function handleUpdateChannelField(
  id: number,
  fieldName: string,
  value: number,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getUpdateChannel(scope)(id, { [fieldName]: value })
    if (response.success) {
      const fieldLabel =
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
      toast.success(
        i18next.t('{{field}} updated to {{value}}', {
          field: fieldLabel,
          value,
        })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    } else {
      toast.error(response.message || i18next.t(ERROR_MESSAGES.UPDATE_FAILED))
    }
  } catch (_error) {
    toast.error(i18next.t(ERROR_MESSAGES.UPDATE_FAILED))
  }
}

export async function handleUpdateTagField(
  tag: string,
  fieldName: 'priority' | 'weight',
  value: number,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const params = { tag, [fieldName]: value }
    const response = await getEditTagChannels(scope)(params)
    if (response.success) {
      const fieldLabel =
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
      toast.success(
        i18next.t('{{field}} updated to {{value}} for tag: {{tag}}', {
          field: fieldLabel,
          value,
          tag,
        })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    } else {
      toast.error(response.message || i18next.t(ERROR_MESSAGES.UPDATE_FAILED))
    }
  } catch (_error) {
    toast.error(i18next.t(ERROR_MESSAGES.UPDATE_FAILED))
  }
}

export async function handleTestChannel(
  id: number,
  options?: { testModel?: string; endpointType?: string; stream?: boolean },
  onTestComplete?: (
    success: boolean,
    responseTime?: number,
    error?: string,
    errorCode?: string
  ) => void,
  scope?: ChannelScopeType
): Promise<void> {
  const payload =
    options && (options.testModel || options.endpointType || options.stream)
      ? {
          ...(options.testModel ? { model: options.testModel } : {}),
          ...(options.endpointType
            ? { endpoint_type: options.endpointType }
            : {}),
          ...(options.stream ? { stream: true } : {}),
        }
      : undefined

  try {
    const response = await getTestChannel(scope)(id, payload)
    if (response.success) {
      toast.success(i18next.t(SUCCESS_MESSAGES.TESTED))
      onTestComplete?.(true, response.data?.response_time)
    } else {
      toast.error(response.message || i18next.t(ERROR_MESSAGES.TEST_FAILED))
      onTestComplete?.(false, undefined, response.message, response.error_code)
    }
  } catch (_error: unknown) {
    const err = _error as { response?: { data?: { message?: string } } }
    const errorMsg =
      err?.response?.data?.message || i18next.t(ERROR_MESSAGES.TEST_FAILED)
    toast.error(errorMsg)
    onTestComplete?.(false, undefined, errorMsg)
  }
}

export async function handleCopyChannel(
  id: number,
  params: CopyChannelParams,
  queryClient?: QueryClient,
  onSuccess?: (newId: number) => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const fn = getCopyChannel(scope)
    if (!fn) return
    const response = await fn(id, params as Record<string, unknown>)
    if (response.success && response.data?.id) {
      toast.success(i18next.t(SUCCESS_MESSAGES.COPIED))
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.(response.data.id)
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to copy channel'))
  }
}

export async function handleUpdateChannelBalance(
  id: number,
  queryClient?: QueryClient,
  onSuccess?: (balance: number) => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const fn = getUpdateChannelBalance(scope)
    if (!fn) return
    const response = await fn(id)
    if (response.success && response.balance !== undefined) {
      const balance = response.balance
      toast.success(
        i18next.t('Balance updated: {{balance}}', {
          balance: formatCurrencyFromUSD(balance, {
            digitsLarge: 2,
            digitsSmall: 4,
            abbreviate: false,
          }),
        })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.(balance)
    } else {
      toast.error(response.message || i18next.t('Failed to update balance'))
    }
  } catch (_error: unknown) {
    toast.error(
      _error instanceof Error
        ? _error.message
        : i18next.t('Failed to update balance')
    )
  }
}

export async function handleBatchDelete(
  ids: number[],
  queryClient?: QueryClient,
  onSuccess?: (deletedCount: number) => void,
  scope?: ChannelScopeType
): Promise<void> {
  if (ids.length === 0) {
    toast.error(i18next.t('No channels selected'))
    return
  }

  try {
    const response = await getBatchDeleteChannels(scope)({ ids })
    if (response.success) {
      toast.success(
        i18next.t('{{count}} channel(s) deleted', {
          count: response.data || ids.length,
        })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.(response.data || ids.length)
    }
  } catch (_error) {
    toast.error(i18next.t(ERROR_MESSAGES.DELETE_FAILED))
  }
}

export async function handleBatchEnable(
  ids: number[],
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  if (ids.length === 0) {
    toast.error(i18next.t('No channels selected'))
    return
  }

  try {
    const updateFn = getUpdateChannel(scope)
    const promises = ids.map((id) =>
      updateFn(id, { status: CHANNEL_STATUS.ENABLED })
    )
    const results = await Promise.allSettled(promises)

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length

    if (successCount > 0) {
      toast.success(
        i18next.t('{{count}} channel(s) enabled', { count: successCount })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }

    if (failCount > 0) {
      toast.error(
        i18next.t('{{count}} channel(s) failed to enable', { count: failCount })
      )
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to enable channels'))
  }
}

export async function handleBatchDisable(
  ids: number[],
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  if (ids.length === 0) {
    toast.error(i18next.t('No channels selected'))
    return
  }

  try {
    const updateFn = getUpdateChannel(scope)
    const promises = ids.map((id) =>
      updateFn(id, { status: CHANNEL_STATUS.MANUAL_DISABLED })
    )
    const results = await Promise.allSettled(promises)

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length

    if (successCount > 0) {
      toast.success(
        i18next.t('{{count}} channel(s) disabled', { count: successCount })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }

    if (failCount > 0) {
      toast.error(
        i18next.t('{{count}} channel(s) failed to disable', {
          count: failCount,
        })
      )
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to disable channels'))
  }
}

export async function handleBatchSetTag(
  ids: number[],
  tag: string | null,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  if (ids.length === 0) {
    toast.error(i18next.t('No channels selected'))
    return
  }

  try {
    const response = await getBatchSetChannelTag(scope)({ ids, tag })
    if (response.success) {
      toast.success(i18next.t(SUCCESS_MESSAGES.TAG_SET))
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to set tag'))
  }
}

export async function handleEnableTagChannels(
  tag: string,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getEnableTagChannels(scope)(tag)
    if (response.success) {
      toast.success(
        i18next.t('Enabled all channels with tag: {{tag}}', { tag })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to enable tag channels'))
  }
}

export async function handleDisableTagChannels(
  tag: string,
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getDisableTagChannels(scope)(tag)
    if (response.success) {
      toast.success(
        i18next.t('Disabled all channels with tag: {{tag}}', { tag })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to disable tag channels'))
  }
}

export async function handleDeleteAllDisabled(
  queryClient?: QueryClient,
  onSuccess?: (deletedCount: number) => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getDeleteDisabledChannels(scope)()
    if (response.success) {
      toast.success(
        i18next.t('{{count}} disabled channel(s) deleted', {
          count: response.data || 0,
        })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.(response.data || 0)
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to delete disabled channels'))
  }
}

export async function handleFixAbilities(
  queryClient?: QueryClient,
  onSuccess?: (result: { success: number; fails: number }) => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getFixChannelAbilities(scope)()
    if (response.success && response.data) {
      toast.success(
        i18next.t('Fixed abilities: {{success}} succeeded, {{fails}} failed', {
          success: response.data.success,
          fails: response.data.fails,
        })
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.(response.data)
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to fix abilities'))
  }
}

export async function handleTestAllChannels(
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getTestAllChannels(scope)()
    if (response.success) {
      toast.success(
        i18next.t(
          'Testing all enabled channels started. Please refresh to see results.'
        )
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    } else {
      toast.error(
        response.message || i18next.t('Failed to start testing all channels')
      )
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to test all channels'))
  }
}

export async function handleUpdateAllBalances(
  queryClient?: QueryClient,
  onSuccess?: () => void,
  scope?: ChannelScopeType
): Promise<void> {
  try {
    const response = await getUpdateAllChannelsBalance(scope)()
    if (response.success) {
      toast.success(
        i18next.t(
          'Updating all channel balances. This may take a while. Please refresh to see results.'
        )
      )
      queryClient?.invalidateQueries({
        queryKey: getQueryKeys(scope).lists(),
      })
      onSuccess?.()
    } else {
      toast.error(
        response.message || i18next.t('Failed to update all balances')
      )
    }
  } catch (_error) {
    toast.error(i18next.t('Failed to update all balances'))
  }
}
