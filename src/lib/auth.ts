import NextAuth, { type NextAuthOptions, type DefaultSession } from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & { id: string }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    SpotifyProvider({
      clientId: process.env['SPOTIFY_CLIENT_ID']!,
      clientSecret: process.env['SPOTIFY_CLIENT_SECRET']!,
      authorization: {
        params: {
          scope:
            process.env['SPOTIFY_SCOPE'] ??
            'user-read-email playlist-modify-public playlist-modify-private',
        },
      },
    }),
    ...(process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']
      ? [
          GoogleProvider({
            clientId: process.env['GOOGLE_CLIENT_ID']!,
            clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
  pages: {},
}
