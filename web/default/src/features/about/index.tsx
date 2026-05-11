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
import { useQuery } from '@tanstack/react-query'
import {
  Zap,
  Shield,
  BarChart3,
  Globe,
  Users,
  CreditCard,
  GitBranch,
  Layers,
  KeyRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicLayout } from '@/components/layout'
import { getAboutContent } from './api'

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

const features = [
  {
    icon: Globe,
    titleKey: 'about.feature.unifiedApi.title',
    descKey: 'about.feature.unifiedApi.desc',
  },
  {
    icon: Layers,
    titleKey: 'about.feature.providers.title',
    descKey: 'about.feature.providers.desc',
  },
  {
    icon: Users,
    titleKey: 'about.feature.userManagement.title',
    descKey: 'about.feature.userManagement.desc',
  },
  {
    icon: CreditCard,
    titleKey: 'about.feature.billing.title',
    descKey: 'about.feature.billing.desc',
  },
  {
    icon: Shield,
    titleKey: 'about.feature.rateLimit.title',
    descKey: 'about.feature.rateLimit.desc',
  },
  {
    icon: BarChart3,
    titleKey: 'about.feature.monitoring.title',
    descKey: 'about.feature.monitoring.desc',
  },
]

const techStack = [
  { name: 'Go', role: 'about.tech.backend' },
  { name: 'Gin', role: 'about.tech.framework' },
  { name: 'GORM', role: 'about.tech.orm' },
  { name: 'React 19', role: 'about.tech.frontend' },
  { name: 'TypeScript', role: 'about.tech.lang' },
  { name: 'Tailwind CSS', role: 'about.tech.css' },
  { name: 'SQLite / MySQL / PostgreSQL', role: 'about.tech.db' },
  { name: 'Redis', role: 'about.tech.cache' },
]

const providers = [
  'OpenAI',
  'Claude',
  'Gemini',
  'DeepSeek',
  'Moonshot',
  'Zhipu',
  'Qwen',
  'Azure',
  'AWS Bedrock',
  'SiliconFlow',
  'VolcEngine',
  'MiniMax',
  'Cohere',
  'Mistral',
  'xAI',
  'OpenRouter',
  'Ollama',
  'Midjourney',
  'Kling',
  'Doubao',
]

function DefaultAboutPage() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <div className='space-y-20 py-12'>
      {/* Hero */}
      <section className='mx-auto max-w-4xl space-y-6 px-4 text-center'>
        <div className='flex justify-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10'>
            <Zap className='h-10 w-10 text-primary' />
          </div>
        </div>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>
          {t('about.hero.title')}
        </h1>
        <p className='text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed'>
          {t('about.hero.subtitle')}
        </p>
        <div className='flex justify-center gap-4 pt-4'>
          <a
            href='https://github.com/QuantumNous/new-api'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'
          >
            <GitBranch className='h-4 w-4' />
            {t('about.hero.github')}
          </a>
          <a
            href='/docs'
            className='border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors'
          >
            {t('about.hero.docs')}
          </a>
        </div>
      </section>

      {/* Features */}
      <section className='mx-auto max-w-6xl px-4'>
        <h2 className='mb-10 text-center text-2xl font-bold'>
          {t('about.features.title')}
        </h2>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((f) => (
            <div
              key={f.titleKey}
              className='bg-card text-card-foreground hover:border-primary/50 group rounded-xl border p-6 transition-colors'
            >
              <div className='bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-primary/20'>
                <f.icon className='h-5 w-5 text-primary' />
              </div>
              <h3 className='mb-2 font-semibold'>{t(f.titleKey)}</h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {t(f.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Providers */}
      <section className='mx-auto max-w-6xl px-4'>
        <h2 className='mb-10 text-center text-2xl font-bold'>
          {t('about.providers.title')}
        </h2>
        <div className='flex flex-wrap justify-center gap-3'>
          {providers.map((p) => (
            <span
              key={p}
              className='bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium'
            >
              {p}
            </span>
          ))}
          <span className='text-muted-foreground inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium'>
            {t('about.providers.more')}
          </span>
        </div>
      </section>

      {/* Tech Stack */}
      <section className='mx-auto max-w-4xl px-4'>
        <h2 className='mb-10 text-center text-2xl font-bold'>
          {t('about.tech.title')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {techStack.map((item) => (
            <div
              key={item.name}
              className='bg-muted/50 flex flex-col items-center rounded-xl p-4 text-center'
            >
              <span className='font-semibold'>{item.name}</span>
              <span className='text-muted-foreground text-xs'>
                {t(item.role)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className='mx-auto max-w-4xl px-4'>
        <div className='grid gap-6 sm:grid-cols-3'>
          <div className='text-center'>
            <div className='text-primary mb-2 text-4xl font-bold'>40+</div>
            <div className='text-muted-foreground text-sm'>
              {t('about.stats.providers')}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-primary mb-2 text-4xl font-bold'>3</div>
            <div className='text-muted-foreground text-sm'>
              {t('about.stats.databases')}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-primary mb-2 flex items-center justify-center text-4xl font-bold'>
              <KeyRound className='h-8 w-8' />
            </div>
            <div className='text-muted-foreground text-sm'>
              {t('about.stats.auth')}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t pt-10'>
        <div className='mx-auto max-w-4xl space-y-4 px-4 text-center text-sm text-muted-foreground'>
          <p>
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('NewAPI')}
            </a>{' '}
            © {currentYear}{' '}
            <a
              href='https://github.com/QuantumNous'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('QuantumNous')}
            </a>{' '}
            {t('| Based on')}{' '}
            <a
              href='https://github.com/songquanpeng/one-api'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('One API')}
            </a>
          </p>
          <p>
            {t('This project must be used in compliance with the')}{' '}
            <a
              href='https://github.com/QuantumNous/new-api/blob/main/LICENSE'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('AGPL v3.0 License')}
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyHtml(rawContent)

  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return (
      <PublicLayout>
        <DefaultAboutPage />
      </PublicLayout>
    )
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        {isHtml ? (
          <div
            className='prose prose-neutral dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: rawContent }}
          />
        ) : (
          <Markdown className='prose-neutral dark:prose-invert max-w-none'>
            {rawContent}
          </Markdown>
        )}
      </div>
    </PublicLayout>
  )
}
