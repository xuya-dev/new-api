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
import {
  Share2,
  Gift,
  TrendingUp,
  Clock,
  ArrowRightLeft,
  Coins,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function TokenSharing() {
  const { t } = useTranslation()

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        {/* Header */}
        <AnimateInView className='mb-16 text-center md:mb-20'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('home.tokenSharing.badge')}
          </p>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('home.tokenSharing.title')}
          </h2>
          <p className='text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed'>
            {t('home.tokenSharing.subtitle')}
          </p>
        </AnimateInView>

        {/* Two-column layout: Provider vs Consumer */}
        <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
          {/* Provider Card */}
          <AnimateInView delay={100} animation='fade-up'>
            <div className='bg-card border-border/50 group relative overflow-hidden rounded-2xl border p-8'>
              <div className='from-primary/5 to-primary/0 absolute inset-0 bg-gradient-to-br' />
              <div className='relative'>
                <div className='mb-6 flex items-center gap-4'>
                  <div className='bg-primary/10 flex size-14 items-center justify-center rounded-xl'>
                    <Share2 className='size-7 text-primary' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold'>
                      {t('home.tokenSharing.provider.title')}
                    </h3>
                    <p className='text-muted-foreground text-sm'>
                      {t('home.tokenSharing.provider.subtitle')}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full'>
                      <Gift className='size-3.5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>
                        {t('home.tokenSharing.provider.step1.title')}
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {t('home.tokenSharing.provider.step1.desc')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full'>
                      <Clock className='size-3.5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>
                        {t('home.tokenSharing.provider.step2.title')}
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {t('home.tokenSharing.provider.step2.desc')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full'>
                      <Coins className='size-3.5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>
                        {t('home.tokenSharing.provider.step3.title')}
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {t('home.tokenSharing.provider.step3.desc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='mt-6 rounded-xl bg-muted/50 p-4'>
                  <div className='flex items-center gap-2 text-sm'>
                    <TrendingUp className='size-4 text-emerald-500' />
                    <span className='font-medium'>
                      {t('home.tokenSharing.provider.reward.title')}
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                    {t('home.tokenSharing.provider.reward.desc')}
                  </p>
                </div>
              </div>
            </div>
          </AnimateInView>

          {/* Consumer Card */}
          <AnimateInView delay={200} animation='fade-up'>
            <div className='bg-card border-border/50 group relative overflow-hidden rounded-2xl border p-8'>
              <div className='from-blue-500/5 to-blue-500/0 absolute inset-0 bg-gradient-to-br' />
              <div className='relative'>
                <div className='mb-6 flex items-center gap-4'>
                  <div className='bg-blue-500/10 flex size-14 items-center justify-center rounded-xl'>
                    <ArrowRightLeft className='size-7 text-blue-500' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold'>
                      {t('home.tokenSharing.consumer.title')}
                    </h3>
                    <p className='text-muted-foreground text-sm'>
                      {t('home.tokenSharing.consumer.subtitle')}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <div className='bg-blue-500/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full'>
                      <Coins className='size-3.5 text-blue-500' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>
                        {t('home.tokenSharing.consumer.step1.title')}
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {t('home.tokenSharing.consumer.step1.desc')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='bg-blue-500/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full'>
                      <ArrowRightLeft className='size-3.5 text-blue-500' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>
                        {t('home.tokenSharing.consumer.step2.title')}
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {t('home.tokenSharing.consumer.step2.desc')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='bg-blue-500/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full'>
                      <TrendingUp className='size-3.5 text-blue-500' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>
                        {t('home.tokenSharing.consumer.step3.title')}
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {t('home.tokenSharing.consumer.step3.desc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='mt-6 rounded-xl bg-muted/50 p-4'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Gift className='size-4 text-blue-500' />
                    <span className='font-medium'>
                      {t('home.tokenSharing.consumer.benefit.title')}
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                    {t('home.tokenSharing.consumer.benefit.desc')}
                  </p>
                </div>
              </div>
            </div>
          </AnimateInView>
        </div>

        {/* Bottom stats */}
        <AnimateInView delay={300} animation='fade-up' className='mt-16'>
          <div className='border-border/40 bg-muted/30 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border md:grid-cols-4'>
            {[
              {
                value: '24h',
                label: t('home.tokenSharing.stats.settlement'),
              },
              {
                value: '50%',
                label: t('home.tokenSharing.stats.uptime'),
              },
              {
                value: '100+',
                label: t('home.tokenSharing.stats.hourly'),
              },
              {
                value: '1%',
                label: t('home.tokenSharing.stats.bonus'),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className='bg-background flex flex-col items-center py-6 text-center'
              >
                <div className='text-primary mb-1 text-2xl font-bold'>
                  {stat.value}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
