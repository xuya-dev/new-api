import { useTranslation } from 'react-i18next'
import { SectionPageLayout } from '@/components/layout'
import * as channelApi from './api'
import { ChannelsDialogs } from './components/channels-dialogs'
import { ChannelsPrimaryButtons } from './components/channels-primary-buttons'
import { ChannelsProvider } from './components/channels-provider'
import { ChannelsTable } from './components/channels-table'
import { channelsQueryKeys } from './lib'
import type { ChannelScopeType } from './lib/channel-scope'

const adminScope: ChannelScopeType = {
  api: {
    getChannels: (params) => channelApi.getChannels(params as Parameters<typeof channelApi.getChannels>[0]),
    searchChannels: (params) => channelApi.searchChannels(params as Parameters<typeof channelApi.searchChannels>[0]),
    getChannel: channelApi.getChannel,
    createChannel: (data) => channelApi.createChannel(data as unknown as Parameters<typeof channelApi.createChannel>[0]),
    updateChannel: channelApi.updateChannel,
    deleteChannel: channelApi.deleteChannel,
    testChannel: channelApi.testChannel as ChannelScopeType['api']['testChannel'],
    updateChannelBalance: channelApi.updateChannelBalance,
    copyChannel: channelApi.copyChannel as ChannelScopeType['api']['copyChannel'],
    fetchUpstreamModels: channelApi.fetchUpstreamModels,
    testAllChannels: channelApi.testAllChannels,
    updateAllChannelsBalance: channelApi.updateAllChannelsBalance,
    fixChannelAbilities: channelApi.fixChannelAbilities,
    deleteDisabledChannels: channelApi.deleteDisabledChannels,
    batchDeleteChannels: channelApi.batchDeleteChannels,
    batchSetChannelTag: channelApi.batchSetChannelTag,
    enableTagChannels: channelApi.enableTagChannels,
    disableTagChannels: channelApi.disableTagChannels,
    editTagChannels: channelApi.editTagChannels,
    manageMultiKeys: channelApi.manageMultiKeys as unknown as ChannelScopeType['api']['manageMultiKeys'],
    deleteOllamaModel: channelApi.deleteOllamaModel,
    getOllamaVersion: channelApi.getOllamaVersion,
    getGroups: channelApi.getGroups,
  },
  queryKeys: channelsQueryKeys,
  features: {
    tagMode: true,
    idSort: true,
    testAll: true,
    updateAllBalances: true,
    fixAbilities: true,
    deleteAllDisabled: true,
    upstreamUpdates: true,
    copyChannel: true,
    balanceQuery: true,
    fetchModels: true,
    ollamaModels: true,
    multiKeyManage: true,
    tagBatchEdit: true,
    priorityWeight: true,
    enableDisable: true,
    batchOperations: true,
    search: true,
    modelFilter: true,
    groupFilter: true,
    typeFilter: true,
    rewardColumn: false,
  },
}

export function Channels() {
  const { t } = useTranslation()

  return (
    <ChannelsProvider scope={adminScope}>
      <SectionPageLayout>
        <SectionPageLayout.Title>{t('Channels')}</SectionPageLayout.Title>
        <SectionPageLayout.Description>
          {t('Manage API channels and provider configurations')}
        </SectionPageLayout.Description>
        <SectionPageLayout.Actions>
          <ChannelsPrimaryButtons />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <ChannelsTable />
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <ChannelsDialogs />
    </ChannelsProvider>
  )
}
