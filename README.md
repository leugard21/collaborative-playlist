# Collaborative Playlist

A modern **collaborative playlist web app** built with Next.js, Spotify API, and real-time updates.  
Create, share, and manage playlists with friends — add tracks, vote, and comment together in real time.

## Tech Stack

- **Framework**: [Next.js App Router](https://nextjs.org/) (TypeScript, Server Components first)
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [lucide-react](https://lucide.dev/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Spotify OAuth, Google optional)
- **Database**: [Prisma](https://www.prisma.io/) + PostgreSQL (Supabase / Neon / PlanetScale)
- **Realtime**: Pusher / Ably / Supabase Realtime
- **Media API**: [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- **Testing**: [Vitest](https://vitest.dev/), React Testing Library, Playwright
- **Quality**: ESLint, Prettier, TypeScript strict mode
- **Accessibility**: ARIA roles, keyboard support
- **Performance**: RSC-first data fetching, route-based code-splitting, image optimization

## Features

### Authentication & Profiles

- OAuth login with Spotify (Google optional)
- Profile page with display name, avatar, connected services

### Playlists

- Create playlist (title, description, visibility: private / link / public)
- Invite collaborators via share link (owner, editor, viewer roles)
- Realtime updates for track add, remove, reorder

### Track Management

- Search tracks via Spotify
- Add tracks to playlist with duplicate detection
- Display duration, artwork, and metadata

### Voting & Moderation

- Upvote/downvote tracks
- Auto-rank tracks based on votes
- Owner/editor can remove or reorder tracks

### Now Playing & Queue

- Display current track, progress, and playback status
- 30-second previews for non-premium users

### Comments & Activity

- Threaded comments per playlist
- Activity feed showing adds, removes, and votes

### Responsive UI

- Mobile: bottom navigation (Home, Search, Playlist, Activity, Profile)
- Desktop: sidebar with keyboard shortcuts
- Accessible components and full keyboard support

## Development

### Prerequisites

- Node.js
- PostgreSQL database (Supabase, Neon, or PlanetScale recommended)
- Spotify Developer account for OAuth

### Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```
