import { useTranslation } from 'react-i18next'
import { formatLogQuota, formatTimestampToDate } from '@/lib/format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { RewardLog } from '../../types'
import { REWARD_TYPE_CONFIG } from '../columns/reward-logs-columns'

function DetailRow(props: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className='flex items-center justify-between gap-4 py-2'>
      <span className='text-muted-foreground text-sm'>{props.label}</span>
      <span
        className={`text-sm font-medium ${props.mono ? 'font-mono tabular-nums' : ''}`}
      >
        {props.value}
      </span>
    </div>
  )
}

export function RewardDetailDialog(props: {
  log: RewardLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  if (!props.log) return null

  const typeConfig =
    REWARD_TYPE_CONFIG[props.log.type as keyof typeof REWARD_TYPE_CONFIG]
  const typeLabel = typeConfig ? t(typeConfig.label) : t('Unknown')

  const renderDetailContent = () => {
    switch (props.log!.type) {
      case 1:
        return (
          <>
            <DetailRow
              label={t('Uptime rate')}
              value={props.log!.detail}
              mono
            />
            <DetailRow
              label={t('Channel')}
              value={`#${props.log!.channel_id}`}
              mono
            />
          </>
        )
      case 2:
        return (
          <DetailRow
            label={t('Channel')}
            value={`#${props.log!.detail}`}
            mono
          />
        )
      case 3:
        return (
          <DetailRow
            label={t('Check-in date')}
            value={props.log!.detail}
            mono
          />
        )
      case 4:
        return (
          <DetailRow label={t('Invite code used')} value={props.log!.detail} />
        )
      case 5:
        return (
          <DetailRow
            label={t('New user invited')}
            value={props.log!.detail}
          />
        )
      case 6:
        return (
          <DetailRow
            label={t('New user registration')}
            value={props.log!.detail}
          />
        )
      default:
        return (
          <DetailRow label={t('Detail')} value={props.log!.detail || '-'} />
        )
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('Reward Details')}</DialogTitle>
          <DialogDescription>
            {t('Detailed information about this reward record')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='space-y-1 px-1'>
            <DetailRow
              label={t('Time')}
              value={
                props.log.created_at
                  ? formatTimestampToDate(props.log.created_at)
                  : '-'
              }
              mono
            />
            <DetailRow label={t('Type')} value={typeLabel} />
            <DetailRow
              label={t('Reward')}
              value={formatLogQuota(props.log.quota)}
              mono
            />
            {props.log.channel_id > 0 &&
              props.log.type !== 3 &&
              props.log.type !== 4 &&
              props.log.type !== 5 &&
              props.log.type !== 6 && (
                <DetailRow
                  label={t('Channel')}
                  value={`#${props.log.channel_id}`}
                  mono
                />
              )}
            {props.log.detail && renderDetailContent()}
            <DetailRow
              label={t('Raw Quota')}
              value={props.log.quota.toLocaleString()}
              mono
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
