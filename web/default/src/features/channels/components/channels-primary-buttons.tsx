import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  MoreHorizontal,
  Settings2,
  Trash2,
  Tags,
  TestTube,
  DollarSign,
  SortAsc,
  RefreshCw,
  ArrowUpFromLine,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  handleDeleteAllDisabled,
  handleFixAbilities,
  handleTestAllChannels,
  handleUpdateAllBalances,
} from '../lib'
import { useChannelScope } from '../lib/channel-scope'
import { useChannels } from './channels-provider'

export function ChannelsPrimaryButtons() {
  const { t } = useTranslation()
  const {
    setOpen,
    enableTagMode,
    setEnableTagMode,
    idSort,
    setIdSort,
    upstream,
  } = useChannels()
  const queryClient = useQueryClient()
  const scope = useChannelScope()
  const features = scope.features
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleTagModeToggle = (checked: boolean) => {
    localStorage.setItem('enable-tag-mode', String(checked))
    setEnableTagMode(checked)
  }

  const handleIdSortToggle = (checked: boolean) => {
    localStorage.setItem('channels-id-sort', String(checked))
    setIdSort(checked)
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        {features.tagMode && (
          <div className='hidden items-center gap-2 rounded-md border px-3 py-1.5 sm:flex'>
            <Tags className='text-muted-foreground h-4 w-4' />
            <Label htmlFor='tag-mode' className='cursor-pointer text-sm'>
              {t('Tag Mode')}
            </Label>
            <Switch
              id='tag-mode'
              checked={enableTagMode}
              onCheckedChange={handleTagModeToggle}
            />
          </div>
        )}

        {features.idSort && (
          <div className='hidden items-center gap-2 rounded-md border px-3 py-1.5 sm:flex'>
            <SortAsc className='text-muted-foreground h-4 w-4' />
            <Label htmlFor='id-sort' className='cursor-pointer text-sm'>
              {t('Sort by ID')}
            </Label>
            <Switch
              id='id-sort'
              checked={idSort}
              onCheckedChange={handleIdSortToggle}
            />
          </div>
        )}

        <Button onClick={() => setOpen('create-channel')} size='sm'>
          <Plus className='h-4 w-4' />
          <span className='max-sm:hidden'>{t('Create Channel')}</span>
          <span className='sm:hidden'>{t('Create')}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant='outline' size='sm' />}>
            <MoreHorizontal className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            {features.tagMode && (
              <DropdownMenuCheckboxItem
                className='sm:hidden'
                checked={enableTagMode}
                onCheckedChange={handleTagModeToggle}
              >
                <Tags className='mr-2 h-4 w-4' />
                {t('Tag Mode')}
              </DropdownMenuCheckboxItem>
            )}

            {features.idSort && (
              <DropdownMenuCheckboxItem
                className='sm:hidden'
                checked={idSort}
                onCheckedChange={handleIdSortToggle}
              >
                <SortAsc className='mr-2 h-4 w-4' />
                {t('Sort by ID')}
              </DropdownMenuCheckboxItem>
            )}

            {(features.tagMode || features.idSort) && (
              <DropdownMenuSeparator className='sm:hidden' />
            )}

            {features.testAll && (
              <DropdownMenuItem
                onClick={() => {
                  handleTestAllChannels(queryClient, undefined, scope)
                }}
              >
                {t('Test All Channels')}
                <DropdownMenuShortcut>
                  <TestTube className='h-4 w-4' />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}

            {features.updateAllBalances && (
              <DropdownMenuItem
                onClick={() => {
                  handleUpdateAllBalances(queryClient, undefined, scope)
                }}
              >
                {t('Update All Balances')}
                <DropdownMenuShortcut>
                  <DollarSign className='h-4 w-4' />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}

            {features.upstreamUpdates && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => upstream.detectAllUpdates()}
                  disabled={upstream.detectAllLoading}
                >
                  {t('Detect All Upstream Updates')}
                  <DropdownMenuShortcut>
                    <RefreshCw className='h-4 w-4' />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => upstream.applyAllUpdates()}
                  disabled={upstream.applyAllLoading}
                >
                  {t('Apply All Upstream Updates')}
                  <DropdownMenuShortcut>
                    <ArrowUpFromLine className='h-4 w-4' />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </>
            )}

            {features.fixAbilities && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    handleFixAbilities(queryClient, (_result) => {
                      // eslint-disable-next-line no-console
                      console.log('Fix abilities result:', _result)
                    }, scope)
                  }}
                >
                  {t('Fix Abilities')}
                  <DropdownMenuShortcut>
                    <Settings2 className='h-4 w-4' />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </>
            )}

            {features.deleteAllDisabled && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setShowDeleteDialog(true)
                  }}
                  className='text-destructive focus:text-destructive'
                >
                  {t('Delete All Disabled')}
                  <DropdownMenuShortcut>
                    <Trash2 className='h-4 w-4' />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {features.deleteAllDisabled && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t('Delete All Disabled Channels?')}
          desc='This will permanently delete all manually and automatically disabled channels. This action cannot be undone.'
          destructive
          handleConfirm={() => {
            handleDeleteAllDisabled(queryClient, (_count) => {
              // eslint-disable-next-line no-console
              console.log(`Deleted ${_count} channels`)
            }, scope)
            setShowDeleteDialog(false)
          }}
        />
      )}
    </>
  )
}
