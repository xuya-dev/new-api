import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { formatLogQuota } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useIsAdmin } from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { getRewardLogStats } from '../api'
import { DEFAULT_REWARD_STATS } from '../constants'

const route = getRouteApi('/_authenticated/usage-logs/$section')

function StatBadge(props: {
  label: string
  value: string | number
  accent: string
}) {
  return (
    <span className='border-border/60 bg-muted/25 inline-flex h-7 items-center gap-2 rounded-md border px-2.5 text-xs shadow-xs'>
      <span className={cn('h-3.5 w-0.5 rounded-full', props.accent)} />
      <span className='text-muted-foreground'>{props.label}</span>
      <span className='text-foreground/85 font-mono font-semibold tabular-nums'>
        {props.value}
      </span>
    </span>
  )
}

export function RewardLogsStats() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const searchParams = route.useSearch()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reward-logs-stats', isAdmin, searchParams],
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (searchParams.type) {
        params.type = searchParams.type
      }
      if (searchParams.channel) {
        params.channel = searchParams.channel
      }
      if (searchParams.startTime) {
        params.start_timestamp = Math.floor(
          (searchParams.startTime as number) / 1000
        )
      }
      if (searchParams.endTime) {
        params.end_timestamp = Math.floor(
          (searchParams.endTime as number) / 1000
        )
      }

      const result = await getRewardLogStats(params, isAdmin)
      return result.success
        ? result.data || DEFAULT_REWARD_STATS
        : DEFAULT_REWARD_STATS
    },
    placeholderData: (previousData) => previousData,
  })

  if (isLoading) {
    return (
      <div className='flex items-center gap-2'>
        <Skeleton className='h-7 w-[150px] rounded-md' />
        <Skeleton className='h-7 w-[100px] rounded-md' />
      </div>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <StatBadge
        label={t('Total Rewards')}
        value={formatLogQuota(stats?.total_quota || 0)}
        accent='bg-emerald-500/70'
      />
      <StatBadge
        label={t('Count')}
        value={(stats?.total_count || 0).toLocaleString()}
        accent='bg-sky-500/70'
      />
    </div>
  )
}
