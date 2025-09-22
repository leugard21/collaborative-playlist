-- DropIndex
DROP INDEX "public"."Playlist_ownerId_idx";

-- DropIndex
DROP INDEX "public"."Playlist_visibility_idx";

-- CreateTable
CREATE TABLE "public"."Invite" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "public"."Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_playlistId_idx" ON "public"."Invite"("playlistId");

-- CreateIndex
CREATE INDEX "Invite_createdById_idx" ON "public"."Invite"("createdById");

-- CreateIndex
CREATE INDEX "Playlist_ownerId_visibility_idx" ON "public"."Playlist"("ownerId", "visibility");

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
