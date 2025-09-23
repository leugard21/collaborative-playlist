-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('TRACK_ADD', 'TRACK_REMOVE', 'TRACK_REORDER', 'VOTE', 'COMMENT');

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "public"."ActivityType" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_playlistId_createdAt_idx" ON "public"."Activity"("playlistId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
