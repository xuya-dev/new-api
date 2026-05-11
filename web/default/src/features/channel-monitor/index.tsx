import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { CHANNEL_TYPES } from '@/features/channels/constants'
import * as monitorApi from './api'

function HourlyTrendMini({ stats }: { stats: monitorApi.HourlyStatus[] }) {
  return (
    <div className='flex items-center gap-0.5'>
      {stats.map((s, i) => (
        <div
          key={i}
          className={`w-2 h-4 rounded-sm ${
            s.status === 1
              ? 'bg-green-500'
              : s.status === 0
                ? 'bg-red-500'
                : 'bg-gray-300 dark:bg-gray-600'
          }`}
          title={`${s.hour}:00 - ${s.status === 1 ? '正常' : s.status === 0 ? '异常' : '无数据'} (${s.success}/${s.total})`}
        />
      ))}
    </div>
  )
}

function HourlyTrendChart({ stats }: { stats: monitorApi.HourlyStatus[] }) {
  const { t } = useTranslation()
  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium text-muted-foreground'>{t('24小时成功率趋势')}</h4>
      <div className='flex items-end gap-1 h-16'>
        {stats.map((s, i) => (
          <div key={i} className='flex-1 flex flex-col items-center gap-1'>
            <div
              className={`w-full rounded-sm transition-all ${
                s.status === 1
                  ? 'bg-green-500'
                  : s.status === 0
                    ? 'bg-red-500'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: s.total > 0 ? `${Math.max(20, (s.success / s.total) * 100)}%` : '4px' }}
            />
            <span className='text-[10px] text-muted-foreground'>{s.hour}h</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChannelMonitor() {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['channel-monitor'],
    queryFn: monitorApi.getChannelMonitor,
    refetchInterval: 30000,
  })

  const channels: monitorApi.MonitorChannel[] = data?.data || []

  const enabledCount = channels.filter(c => c.status === 1).length
  const disabledCount = channels.filter(c => c.status !== 1).length
  const avgResponse = channels.length > 0
    ? Math.round(channels.reduce((s, c) => s + (c.response_time || 0), 0) / channels.length)
    : 0

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className='space-y-4 p-4'>
      <div className='grid grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'><CardTitle className='text-sm'>{t('Total Channels')}</CardTitle></CardHeader>
          <CardContent><p className='text-2xl font-bold'>{channels.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'><CardTitle className='text-sm'>{t('Online')}</CardTitle></CardHeader>
          <CardContent><p className='text-2xl font-bold text-green-600'>{enabledCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'><CardTitle className='text-sm'>{t('Offline')}</CardTitle></CardHeader>
          <CardContent><p className='text-2xl font-bold text-red-600'>{disabledCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'><CardTitle className='text-sm'>{t('Avg Response')}</CardTitle></CardHeader>
          <CardContent><p className='text-2xl font-bold'>{avgResponse}ms</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle>{t('Channel Monitor')}</CardTitle>
          <Button variant='outline' size='icon' onClick={() => refetch()}>
            <RefreshCw className='size-4' />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-8' />
                <TableHead className='w-16'>ID</TableHead>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Type')}</TableHead>
                <TableHead>{t('Status')}</TableHead>
                <TableHead>{t('Response Time')}</TableHead>
                <TableHead>{t('24H Trend')}</TableHead>
                <TableHead>{t('Last Test')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className='text-center py-8'>{t('Loading...')}</TableCell></TableRow>
              ) : channels.length === 0 ? (
                <TableRow><TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>{t('No channels')}</TableCell></TableRow>
              ) : (
                channels.map(ch => [
                  <TableRow
                    key={ch.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => toggleExpand(ch.id)}
                  >
                    <TableCell>
                      {expandedId === ch.id
                        ? <ChevronDown className='size-4' />
                        : <ChevronRight className='size-4' />
                      }
                    </TableCell>
                    <TableCell>{ch.id}</TableCell>
                    <TableCell className='font-medium'>{ch.name}</TableCell>
                    <TableCell>{CHANNEL_TYPES[ch.type as keyof typeof CHANNEL_TYPES] || `Type ${ch.type}`}</TableCell>
                    <TableCell>
                      <span className='flex items-center gap-2'>
                        <span className={`inline-block size-2 rounded-full ${ch.status === 1 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Badge variant={ch.status === 1 ? 'default' : 'destructive'}>
                          {ch.status === 1 ? t('Online') : t('Offline')}
                        </Badge>
                      </span>
                    </TableCell>
                    <TableCell>{ch.response_time > 0 ? `${ch.response_time}ms` : '-'}</TableCell>
                    <TableCell>
                      <MonitorHourlyMini channelId={ch.id} />
                    </TableCell>
                    <TableCell>{ch.test_time > 0 ? new Date(ch.test_time * 1000).toLocaleString() : '-'}</TableCell>
                  </TableRow>,
                  expandedId === ch.id && (
                    <TableRow key={`${ch.id}-detail`}>
                      <TableCell colSpan={8} className='p-0'>
                        <MonitorDetail channelId={ch.id} />
                      </TableCell>
                    </TableRow>
                  )
                ]).flat()
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MonitorHourlyMini({ channelId }: { channelId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['channel-monitor-detail', channelId, 'hourly'],
    queryFn: () => monitorApi.getChannelMonitorDetail(channelId, 1),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <div className='h-4 w-12 bg-muted rounded animate-pulse' />

  const stats: monitorApi.HourlyStatus[] = data?.data?.hourly_stats || []
  return <HourlyTrendMini stats={stats} />
}

function MonitorDetail({ channelId }: { channelId: number }) {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['channel-monitor-detail', channelId],
    queryFn: () => monitorApi.getChannelMonitorDetail(channelId, 30),
  })

  if (isLoading) {
    return (
      <div className='p-4'>
        <div className='h-4 w-32 bg-muted rounded animate-pulse mb-4' />
        <div className='h-16 bg-muted rounded animate-pulse mb-4' />
        <div className='h-32 bg-muted rounded animate-pulse' />
      </div>
    )
  }

  const logs: monitorApi.MonitorLog[] = data?.data?.logs || []
  const channel = data?.data?.channel
  const hourlyStats: monitorApi.HourlyStatus[] = data?.data?.hourly_stats || []

  return (
    <div className='p-4 space-y-4 bg-muted/30 border-t'>
      {channel && (
        <div className='grid grid-cols-4 gap-4 text-sm'>
          <div><span className='text-muted-foreground'>{t('Name')}:</span> {channel.name}</div>
          <div><span className='text-muted-foreground'>{t('Type')}:</span> {CHANNEL_TYPES[channel.type as keyof typeof CHANNEL_TYPES]}</div>
          <div><span className='text-muted-foreground'>{t('Status')}:</span> {channel.status === 1 ? t('Enabled') : t('Disabled')}</div>
          <div><span className='text-muted-foreground'>{t('Response')}:</span> {channel.response_time}ms</div>
        </div>
      )}

      {hourlyStats.length > 0 && (
        <HourlyTrendChart stats={hourlyStats} />
      )}

      <div>
        <h4 className='text-sm font-medium text-muted-foreground mb-2'>{t('Recent Test Records')}</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Time')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
              <TableHead>{t('Response Time')}</TableHead>
              <TableHead>{t('Error')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className='text-center'>{t('No test records')}</TableCell></TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className='text-xs'>{new Date(log.tested_at * 1000).toLocaleString()}</TableCell>
                  <TableCell>
                    {log.status === 1
                      ? <Badge variant='default'>{t('Success')}</Badge>
                      : <Badge variant='destructive'>{t('Failed')}</Badge>}
                  </TableCell>
                  <TableCell>{log.response_time}ms</TableCell>
                  <TableCell className='text-xs text-muted-foreground max-w-48 truncate'>{log.error_msg || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
