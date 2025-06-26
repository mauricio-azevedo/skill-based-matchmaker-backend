/*
  Warnings:

  - A unique constraint covering the columns `[groupId,roundNumber]` on the table `Round` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Match_roundId_idx" ON "Match"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_groupId_roundNumber_key" ON "Round"("groupId", "roundNumber");
