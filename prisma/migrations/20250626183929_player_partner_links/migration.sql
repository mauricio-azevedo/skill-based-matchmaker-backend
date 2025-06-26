-- CreateTable
CREATE TABLE "PlayerPartner" (
    "count" INTEGER NOT NULL DEFAULT 0,
    "playerId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "PlayerPartner_pkey" PRIMARY KEY ("playerId","partnerId")
);

-- CreateIndex
CREATE INDEX "PlayerPartner_groupId_playerId_idx" ON "PlayerPartner"("groupId", "playerId");

-- AddForeignKey
ALTER TABLE "PlayerPartner" ADD CONSTRAINT "PlayerPartner_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPartner" ADD CONSTRAINT "PlayerPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPartner" ADD CONSTRAINT "PlayerPartner_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
