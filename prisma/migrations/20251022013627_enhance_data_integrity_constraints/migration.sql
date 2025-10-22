/*
  Warnings:

  - A unique constraint covering the columns `[statusName]` on the table `order_status` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `deliveryMans` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `deliveryMans` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `deliveryMans` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "deliveryMans" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_status_statusName_key" ON "order_status"("statusName");
