import Pusher from 'pusher'

export const pusherServer = new Pusher({
  appId: process.env['PUSHER_APP_ID']!,
  key: process.env['PUSHER_KEY']!,
  secret: process.env['PUSHER_SECRET']!,
  cluster: process.env['PUSHER_CLUSTER']!,
  useTLS: true,
})

import PusherClient from 'pusher-js'

let _client: PusherClient | null = null
export function getPusherClient() {
  if (_client) return _client
  _client = new PusherClient(process.env['NEXT_PUBLIC_PUSHER_KEY']!, {
    cluster: process.env['NEXT_PUBLIC_PUSHER_CLUSTER']!,
    forceTLS: true,
  })
  return _client
}
