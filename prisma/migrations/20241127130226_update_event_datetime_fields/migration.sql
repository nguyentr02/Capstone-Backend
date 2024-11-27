/*
  Warnings:

  - You are about to drop the column `event_end_date` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `event_end_time` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `event_start_date` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `event_start_time` on the `event` table. All the data in the column will be lost.
  - Added the required column `end_datetime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_datetime` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event` DROP COLUMN `event_end_date`,
    DROP COLUMN `event_end_time`,
    DROP COLUMN `event_start_date`,
    DROP COLUMN `event_start_time`,
    ADD COLUMN `end_datetime` DATETIME(3) NOT NULL,
    ADD COLUMN `start_datetime` DATETIME(3) NOT NULL;
