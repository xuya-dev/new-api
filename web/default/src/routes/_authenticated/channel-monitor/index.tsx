import { createFileRoute } from '@tanstack/react-router'
import { ChannelMonitor } from '@/features/channel-monitor'

export const Route = createFileRoute('/_authenticated/channel-monitor/')({
  component: ChannelMonitor,
})
