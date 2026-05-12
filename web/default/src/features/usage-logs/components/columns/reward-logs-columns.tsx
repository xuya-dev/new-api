import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { RewardLog } from '../../types'

const REWARD_TYPE = {
  1: { label: 'Online Reward', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  2: { label: 'Usage Bonus', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
} as const

export function useRewardLogsColumns(): ColumnDef<RewardLog>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'created_at',
      header: t('Time'),
      cell: ({ row }) => {
        const ts = row.original.created_at
        if (!ts) return '-'
        return new Date(ts * 1000).toLocaleString()
      },
    },
    {
      accessorKey: 'channel_id',
      header: t('Channel'),
      cell: ({ row }) => {
        const id = row.original.channel_id
        return id ? `#${id}` : '-'
      },
    },
    {
      accessorKey: 'type',
      header: t('Type'),
      cell: ({ row }) => {
        const type = row.original.type as keyof typeof REWARD_TYPE
        const meta = REWARD_TYPE[type]
        if (!meta) return '-'
        return (
          <Badge variant='outline' className={meta.color}>
            {t(meta.label)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'quota',
      header: t('Reward'),
      cell: ({ row }) => {
        const quota = row.original.quota
        if (!quota) return '-'
        const usd = (quota / 500000).toFixed(6)
        return `$${usd}`
      },
    },
    {
      accessorKey: 'detail',
      header: t('Detail'),
      cell: ({ row }) => {
        const detail = row.original.detail
        if (!detail) return '-'
        const type = row.original.type
        if (type === 1) {
          return t('Uptime rate: {{rate}}', { rate: detail })
        }
        return `Channel #${detail}`
      },
    },
  ]
}
