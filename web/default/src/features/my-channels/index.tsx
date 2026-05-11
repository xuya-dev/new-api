import { useTranslation } from 'react-i18next'
import { SectionPageLayout } from '@/components/layout'
import { ChannelsDialogs } from '@/features/channels/components/channels-dialogs'
import { ChannelsPrimaryButtons } from '@/features/channels/components/channels-primary-buttons'
import { ChannelsProvider } from '@/features/channels/components/channels-provider'
import { ChannelsTable } from '@/features/channels/components/channels-table'
import { userChannelScope } from './api'

export function MyChannels() {
  const { t } = useTranslation()

  return (
    <ChannelsProvider scope={userChannelScope}>
      <SectionPageLayout>
        <SectionPageLayout.Title>{t('My Channels')}</SectionPageLayout.Title>
        <SectionPageLayout.Description>
          {t('Manage your personal API channels and provider configurations')}
        </SectionPageLayout.Description>
        <SectionPageLayout.Actions>
          <ChannelsPrimaryButtons />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <ChannelsTable routePath='/_authenticated/my-channels/' />
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <ChannelsDialogs />
    </ChannelsProvider>
  )
}
