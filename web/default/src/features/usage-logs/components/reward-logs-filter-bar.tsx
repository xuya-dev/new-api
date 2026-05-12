/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState, useEffect, useCallback } from 'react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { useNavigate, getRouteApi } from '@tanstack/react-router'
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useIsAdmin } from '@/hooks/use-admin'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTableToolbar } from '@/components/data-table'
import { getDefaultTimeRange } from '../lib/utils'
import type { RewardLogFilters } from '../types'
import { CompactDateTimeRangePicker } from './compact-date-time-range-picker'
import { RewardLogsStats } from './reward-logs-stats'

const route = getRouteApi('/_authenticated/usage-logs/$section')

interface RewardLogsFilterBarProps<TData> {
  table: Table<TData>
}

export function RewardLogsFilterBar<TData>(
  props: RewardLogsFilterBarProps<TData>
) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchParams = route.useSearch()
  const isAdmin = useIsAdmin()
  const fetchingLogs = useIsFetching({ queryKey: ['logs'] })

  const [filters, setFilters] = useState<RewardLogFilters>(() => {
    const { start, end } = getDefaultTimeRange()
    return { startTime: start, endTime: end }
  })

  useEffect(() => {
    const { start, end } = getDefaultTimeRange()
    const typeArr = searchParams.type as string[] | undefined
    const typeValue = typeArr && typeArr.length === 1 ? Number(typeArr[0]) : undefined
    setFilters({
      startTime: searchParams.startTime
        ? new Date(searchParams.startTime)
        : start,
      endTime: searchParams.endTime ? new Date(searchParams.endTime) : end,
      ...(typeValue ? { type: typeValue } : {}),
      ...(searchParams.channel
        ? { channel: String(searchParams.channel) }
        : {}),
    })
  }, [searchParams.startTime, searchParams.endTime, searchParams.type, searchParams.channel])

  const handleChange = useCallback(
    (field: keyof RewardLogFilters, value: Date | string | number | undefined) => {
      setFilters((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleApply = useCallback(() => {
    const search: Record<string, unknown> = {
      page: 1,
      ...(filters.startTime && { startTime: filters.startTime.getTime() }),
      ...(filters.endTime && { endTime: filters.endTime.getTime() }),
      ...(filters.type ? { type: [String(filters.type)] } : {}),
      ...(filters.channel && { channel: filters.channel }),
    }
    navigate({
      to: '/usage-logs/$section',
      params: { section: 'reward' },
      search,
    })
    queryClient.invalidateQueries({ queryKey: ['logs'] })
    queryClient.invalidateQueries({ queryKey: ['reward-logs-stats'] })
  }, [filters, navigate, queryClient])

  const handleReset = useCallback(() => {
    const { start, end } = getDefaultTimeRange()
    setFilters({ startTime: start, endTime: end })
    navigate({
      to: '/usage-logs/$section',
      params: { section: 'reward' },
      search: {
        page: 1,
        startTime: start.getTime(),
        endTime: end.getTime(),
      },
    })
    queryClient.invalidateQueries({ queryKey: ['logs'] })
    queryClient.invalidateQueries({ queryKey: ['reward-logs-stats'] })
  }, [navigate, queryClient])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleApply()
    },
    [handleApply]
  )

  const hasAdditionalFilters = !!filters.type || !!filters.channel

  return (
    <DataTableToolbar
      table={props.table}
      leftActions={<RewardLogsStats />}
      customSearch={
        <CompactDateTimeRangePicker
          start={filters.startTime}
          end={filters.endTime}
          onChange={({ start, end }) => {
            handleChange('startTime', start)
            handleChange('endTime', end)
          }}
          className='w-full sm:w-[340px]'
        />
      }
      additionalSearch={
        <>
          <Select
            value={filters.type ? String(filters.type) : 'all'}
            onValueChange={(value) =>
              handleChange('type', value === 'all' ? undefined : Number(value))
            }
          >
            <SelectTrigger className='w-full sm:w-[160px]'>
              <SelectValue placeholder={t('All Types')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('All Types')}</SelectItem>
              <SelectItem value='1'>{t('Online Reward')}</SelectItem>
              <SelectItem value='2'>{t('Usage Bonus')}</SelectItem>
              <SelectItem value='3'>{t('Check-in')}</SelectItem>
              <SelectItem value='4'>{t('Invitee Bonus')}</SelectItem>
              <SelectItem value='5'>{t('Inviter Bonus')}</SelectItem>
              <SelectItem value='6'>{t('Registration')}</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Input
              placeholder={t('Channel ID')}
              value={filters.channel || ''}
              onChange={(e) => handleChange('channel', e.target.value)}
              onKeyDown={handleKeyDown}
              className='w-full sm:w-[160px]'
            />
          )}
        </>
      }
      hasAdditionalFilters={hasAdditionalFilters}
      onSearch={handleApply}
      searchLoading={fetchingLogs > 0}
      onReset={handleReset}
    />
  )
}
