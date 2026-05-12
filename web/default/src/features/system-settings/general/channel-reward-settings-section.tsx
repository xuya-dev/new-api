import { z } from 'zod'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

const schema = z.object({
  enabled: z.boolean(),
  onlinePerHour: z.coerce.number().int().min(0),
  usageBonusRate: z.coerce.number().min(0).max(1),
  minUptimeRate: z.coerce.number().min(0).max(1),
})

type Values = z.infer<typeof schema>

export function ChannelRewardSettingsSection({
  defaultValues,
}: {
  defaultValues: {
    enabled: boolean
    onlinePerHour: number
    usageBonusRate: number
    minUptimeRate: number
  }
}) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const form = useForm<Values>({
    resolver: zodResolver(schema) as unknown as Resolver<Values>,
    defaultValues: {
      enabled: defaultValues.enabled,
      onlinePerHour: defaultValues.onlinePerHour,
      usageBonusRate: defaultValues.usageBonusRate,
      minUptimeRate: defaultValues.minUptimeRate,
    },
  })

  const { isDirty, isSubmitting } = form.formState
  const enabled = form.watch('enabled')

  async function onSubmit(values: Values) {
    const updates: Array<{ key: string; value: string }> = []

    if (values.enabled !== defaultValues.enabled) {
      updates.push({
        key: 'channel_reward_setting.enabled',
        value: String(values.enabled),
      })
    }

    if (values.onlinePerHour !== defaultValues.onlinePerHour) {
      updates.push({
        key: 'channel_reward_setting.online_per_hour',
        value: String(values.onlinePerHour),
      })
    }

    if (values.usageBonusRate !== defaultValues.usageBonusRate) {
      updates.push({
        key: 'channel_reward_setting.usage_bonus_rate',
        value: String(values.usageBonusRate),
      })
    }

    if (values.minUptimeRate !== defaultValues.minUptimeRate) {
      updates.push({
        key: 'channel_reward_setting.min_uptime_rate',
        value: String(values.minUptimeRate),
      })
    }

    if (updates.length === 0) {
      toast.info(t('No changes to save'))
      return
    }

    for (const update of updates) {
      await updateOption.mutateAsync(update)
    }

    form.reset(values)
  }

  return (
    <SettingsSection
      title={t('Channel Reward Settings')}
      description={t('Configure channel provider rewards for uptime and usage')}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete='off'
          className='space-y-6'
        >
          <FormField
            control={form.control}
            name='enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>
                    {t('Enable channel reward')}
                  </FormLabel>
                  <FormDescription>
                    {t(
                      'Reward channel providers with quota based on uptime and usage'
                    )}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={updateOption.isPending || isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {enabled && (
            <div className='grid gap-6 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='onlinePerHour'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Online reward per hour')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        placeholder='1000'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Quota rewarded per online hour (e.g. 1000)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='usageBonusRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Usage bonus rate')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        max={1}
                        step={0.01}
                        placeholder='0.5'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Percentage of consumed quota returned to channel provider (0-1, e.g. 0.5 = 50%)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='minUptimeRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Minimum uptime rate')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        max={1}
                        step={0.01}
                        placeholder='0.5'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Minimum uptime rate required to qualify for rewards (0-1, e.g. 0.5 = 50%)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button
            type='submit'
            disabled={!isDirty || updateOption.isPending || isSubmitting}
          >
            {updateOption.isPending || isSubmitting
              ? t('Saving...')
              : t('Save reward settings')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
