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
import { StatusBadge, type StatusBadgeProps } from '@/components/status-badge'
import { useIsAdmin } from '@/hooks/use-admin'
import type { RewardLog } from '../../types'

export const REWARD_TYPE_CONFIG = {
  1: {
    label: 'Online Reward',
    dotClass: 'bg-emerald-500',
    pillBg:
      'border border-emerald-200/40 bg-emerald-50/35 dark:border-emerald-900/40 dark:bg-emerald-950/15',
    pillText: 'text-emerald-700/85 dark:text-emerald-400/85',
    variant: 'green' as StatusBadgeProps['variant'],
    rowTint: '',
  },
  2: {
    label: 'Usage Bonus',
    dotClass: 'bg-blue-500',
    pillBg:
      'border border-blue-200/40 bg-blue-50/35 dark:border-blue-900/40 dark:bg-blue-950/15',
    pillText: 'text-blue-700/85 dark:text-blue-400/85',
    variant: 'blue' as StatusBadgeProps['variant'],
    rowTint: 'bg-blue-50/30 dark:bg-blue-950/15',
  },
  3: {
    label: 'Check-in',
    dotClass: 'bg-amber-500',
    pillBg:
      'border border-amber-200/40 bg-amber-50/35 dark:border-amber-900/40 dark:bg-amber-950/15',
    pillText: 'text-amber-700/85 dark:text-amber-400/85',
    variant: 'orange' as StatusBadgeProps['variant'],
    rowTint: 'bg-amber-50/30 dark:bg-amber-950/15',
  },
  4: {
    label: 'Invitee Bonus',
    dotClass: 'bg-violet-500',
    pillBg:
      'border border-violet-200/40 bg-violet-50/35 dark:border-violet-900/40 dark:bg-violet-950/15',
    pillText: 'text-violet-700/85 dark:text-violet-400/85',
    variant: 'violet' as StatusBadgeProps['variant'],
    rowTint: 'bg-violet-50/30 dark:bg-violet-950/15',
  },
  5: {
    label: 'Inviter Bonus',
    dotClass: 'bg-pink-500',
    pillBg:
      'border border-pink-200/40 bg-pink-50/35 dark:border-pink-900/40 dark:bg-pink-950/15',
    pillText: 'text-pink-700/85 dark:text-pink-400/85',
    variant: 'pink' as StatusBadgeProps['variant'],
    rowTint: 'bg-pink-50/30 dark:bg-pink-950/15',
  },
  6: {
    label: 'Registration',
    dotClass: 'bg-slate-500',
    pillBg:
      'border border-slate-200/40 bg-slate-50/35 dark:border-slate-900/40 dark:bg-slate-950/15',
    pillText: 'text-slate-700/85 dark:text-slate-400/85',
    variant: 'neutral' as StatusBadgeProps['variant'],
    rowTint: 'bg-slate-50/30 dark:bg-slate-950/15',
  },
} as const

export function getRewardRowTint(type: number): string {
  const config = REWARD_TYPE_CONFIG[type as keyof typeof REWARD_TYPE_CONFIG]
  return config?.rowTint ?? ''
}

function formatRewardQuota(quota: number): string {
  if (!quota) return '-'
  return `$${(quota / 500000).toFixed(6)}`
}

export function useRewardLogsColumns(): ColumnDef<RewardLog>[] {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()

  const columns: ColumnDef<RewardLog>[] = [
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Time')} />
      ),
      cell: ({ row }) => {
        const ts = row.original.created_at
        const type = row.original.type as keyof typeof REWARD_TYPE_CONFIG
        const config = REWARD_TYPE_CONFIG[type]

        if (!ts) return <span className='text-muted-foreground text-xs'>-</span>

        return (
          <div className='flex flex-col gap-0.5'>
            <span className='font-mono text-xs tabular-nums'>
              {formatTimestampToDate(ts)}
            </span>
            {config && (
              <StatusBadge
                label={t(config.label)}
                variant={config.variant}
                size='sm'
                copyable={false}
              />
            )}
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
        const type = row.original.type
        // 使用返利（type=2）展示实际消费渠道，其他类型展示 channel_id
        const id = type === 2 ? row.original.consumed_channel_id : row.original.channel_id
        const channelName = type === 2 ? row.original.consumed_channel_name : row.original.channel_name
        if (!id || type === 3 || type === 4 || type === 5 || type === 6) {
          return <span className='text-muted-foreground text-xs'>-</span>
        }
        return (
          <div className='flex flex-col gap-0.5'>
            {channelName && (
              <span className='text-xs font-medium'>{channelName}</span>
            )}
            <StatusBadge
              label={`#${id}`}
              autoColor={String(id)}
              copyText={String(id)}
              size='sm'
              className='font-mono'
            />
          </div>
        )
      },
      meta: { label: t('Channel'), mobileHidden: true },
    },
    ...(isAdmin
      ? [
          {
            accessorKey: 'username',
            header: ({ column }: { column: import('@tanstack/react-table').Column<RewardLog, unknown> }) => (
              <DataTableColumnHeader column={column} title={t('User')} />
            ),
            cell: ({ row }: { row: import('@tanstack/react-table').Row<RewardLog> }) => {
              const username = row.original.username
              if (!username) return <span className='text-muted-foreground text-xs'>-</span>
              return (
                <StatusBadge
                  label={username}
                  autoColor={username}
                  size='sm'
                />
              )
            },
            meta: { label: t('User'), mobileHidden: true },
          } as ColumnDef<RewardLog>,
        ]
      : []),
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

        switch (type) {
          case 1:
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
          case 2:
            return (
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground/70 text-xs'>
                  {t('Consumed channel')}
                </span>
                <StatusBadge
                  label={`#${detail}`}
                  autoColor={detail}
                  size='sm'
                  className='font-mono w-fit'
                />
              </div>
            )
          case 3:
            return (
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground/70 text-xs'>
                  {t('Check-in date')}
                </span>
                <span className='font-mono text-xs font-medium tabular-nums'>
                  {detail}
                </span>
              </div>
            )
          case 4:
            return (
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground/70 text-xs'>
                  {t('Invite code used')}
                </span>
              </div>
            )
          case 5:
            return (
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground/70 text-xs'>
                  {t('New user invited')}
                </span>
              </div>
            )
          case 6:
            return (
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground/70 text-xs'>
                  {t('New user registration')}
                </span>
              </div>
            )
          default:
            return <span className='text-muted-foreground text-xs'>{detail}</span>
        }
      },
      meta: { label: t('Detail') },
      size: 180,
    },
  ]

  return columns
}
