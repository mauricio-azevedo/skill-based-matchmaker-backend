/*
  Warnings:

  - A unique constraint covering the columns `[id,groupId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Player_id_groupId_key" ON "Player"("id", "groupId");
