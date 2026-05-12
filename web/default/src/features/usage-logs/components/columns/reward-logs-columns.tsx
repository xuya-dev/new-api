import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import type { RewardLog } from '../../types'

const REWARD_TYPE_CONFIG = {
  1: {
    label: 'Online Reward',
    variant: 'success' as const,
    dotClass: 'bg-emerald-500',
    pillBg:
      'border border-emerald-200/40 bg-emerald-50/35 dark:border-emerald-900/40 dark:bg-emerald-950/15',
    pillText: 'text-emerald-700/85 dark:text-emerald-400/85',
  },
  2: {
    label: 'Usage Bonus',
    variant: 'info' as const,
    dotClass: 'bg-blue-500',
    pillBg:
      'border border-blue-200/40 bg-blue-50/35 dark:border-blue-900/40 dark:bg-blue-950/15',
    pillText: 'text-blue-700/85 dark:text-blue-400/85',
  },
} as const

function formatRewardQuota(quota: number): string {
  if (!quota) return '-'
  return `$${(quota / 500000).toFixed(6)}`
}

export function useRewardLogsColumns(): ColumnDef<RewardLog>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Time')} />
      ),
      cell: ({ row }) => {
        const ts = row.original.created_at
        if (!ts) return <span className='text-muted-foreground text-xs'>-</span>

        return (
          <div className='flex flex-col gap-0.5'>
            <span className='font-mono text-xs tabular-nums'>
              {formatTimestampToDate(ts)}
            </span>
          </div>
        )
      },
      meta: { label: t('Time') },
      enableHiding: false,
    },
    {
      accessorKey: 'channel_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Channel')} />
      ),
      cell: ({ row }) => {
        const id = row.original.channel_id
        if (!id) return <span className='text-muted-foreground text-xs'>-</span>
        return (
          <StatusBadge
            label={`#${id}`}
            autoColor={String(id)}
            copyText={String(id)}
            size='sm'
            className='font-mono'
          />
        )
      },
      meta: { label: t('Channel'), mobileHidden: true },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Type')} />
      ),
      cell: ({ row }) => {
        const type = row.original.type as keyof typeof REWARD_TYPE_CONFIG
        const config = REWARD_TYPE_CONFIG[type]
        if (!config) return <span className='text-muted-foreground text-xs'>-</span>

        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
              config.pillBg,
              config.pillText
            )}
          >
            <span
              className={cn('size-1.5 shrink-0 rounded-full', config.dotClass)}
              aria-hidden='true'
            />
            {t(config.label)}
          </span>
        )
      },
      meta: { label: t('Type') },
    },
    {
      accessorKey: 'quota',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Reward')} />
      ),
      cell: ({ row }) => {
        const quota = row.original.quota
        if (!quota)
          return <span className='text-muted-foreground text-xs'>-</span>

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className='border-border/80 bg-emerald-50/60 dark:bg-emerald-950/20 inline-flex w-fit cursor-pointer items-center rounded-md border px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-300' />
                }
              >
                {formatRewardQuota(quota)}
              </TooltipTrigger>
              <TooltipContent>
                <span className='text-xs'>
                  {t('Quota')}: {quota.toLocaleString()}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      meta: { label: t('Reward') },
    },
    {
      accessorKey: 'detail',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Detail')} />
      ),
      cell: ({ row }) => {
        const detail = row.original.detail
        const type = row.original.type
        if (!detail)
          return <span className='text-muted-foreground text-xs'>-</span>

        if (type === 1) {
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground/70 text-xs'>
                {t('Uptime rate')}
              </span>
              <span className='font-mono text-xs font-medium tabular-nums'>
                {detail}
              </span>
            </div>
          )
        }

        return (
          <div className='flex flex-col gap-0.5'>
            <span className='text-muted-foreground/70 text-xs'>
              {t('Channel')}
            </span>
            <StatusBadge
              label={`#${detail}`}
              autoColor={detail}
              size='sm'
              className='font-mono w-fit'
            />
          </div>
        )
      },
      meta: { label: t('Detail') },
      size: 180,
    },
  ]
}
