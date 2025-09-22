import { z } from 'zod'

export const createPlaylistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(2000).optional(),
  visibility: z.enum(['PRIVATE', 'LINK', 'PUBLIC']).default('PRIVATE'),
})

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>
