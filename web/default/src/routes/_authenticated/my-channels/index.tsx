import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { MyChannels } from '@/features/my-channels'

const myChannelsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/my-channels/')({
  validateSearch: myChannelsSearchSchema,
  component: MyChannels,
})
