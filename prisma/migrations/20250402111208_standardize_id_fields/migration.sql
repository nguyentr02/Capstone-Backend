/*
  Warnings:

  - The primary key for the `event_questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `event_question_id` on the `event_questions` table. All the data in the column will be lost.
  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `event_id` on the `events` table. All the data in the column will be lost.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `payment_id` on the `payments` table. All the data in the column will be lost.
  - The primary key for the `purchases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `purchase_id` on the `purchases` table. All the data in the column will be lost.
  - The primary key for the `questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `question_id` on the `questions` table. All the data in the column will be lost.
  - The primary key for the `registrations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `registration_id` on the `registrations` table. All the data in the column will be lost.
  - The primary key for the `responses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `response_id` on the `responses` table. All the data in the column will be lost.
  - The primary key for the `tickets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ticket_id` on the `tickets` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `users` table. All the data in the column will be lost.
  - Added the required column `id` to the `event_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `responses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `event_questions` DROP FOREIGN KEY `event_questions_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `event_questions` DROP FOREIGN KEY `event_questions_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_organiser_id_fkey`;

-- DropForeignKey
ALTER TABLE `participants` DROP FOREIGN KEY `participants_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_purchase_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_registration_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_ticket_id_fkey`;

-- DropForeignKey
ALTER TABLE `registrations` DROP FOREIGN KEY `registrations_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `registrations` DROP FOREIGN KEY `registrations_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `responses` DROP FOREIGN KEY `responses_eq_id_fkey`;

-- DropForeignKey
ALTER TABLE `responses` DROP FOREIGN KEY `responses_registration_id_fkey`;

-- DropForeignKey
ALTER TABLE `tickets` DROP FOREIGN KEY `tickets_event_id_fkey`;

-- DropIndex
DROP INDEX `event_questions_event_id_fkey` ON `event_questions`;

-- DropIndex
DROP INDEX `event_questions_question_id_fkey` ON `event_questions`;

-- DropIndex
DROP INDEX `events_organiser_id_fkey` ON `events`;

-- DropIndex
DROP INDEX `participants_user_id_fkey` ON `participants`;

-- DropIndex
DROP INDEX `registrations_event_id_fkey` ON `registrations`;

-- DropIndex
DROP INDEX `registrations_user_id_fkey` ON `registrations`;

-- DropIndex
DROP INDEX `responses_eq_id_fkey` ON `responses`;

-- DropIndex
DROP INDEX `responses_registration_id_fkey` ON `responses`;

-- DropIndex
DROP INDEX `tickets_event_id_fkey` ON `tickets`;

-- AlterTable
ALTER TABLE `event_questions` DROP PRIMARY KEY,
    DROP COLUMN `event_question_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `events` DROP PRIMARY KEY,
    DROP COLUMN `event_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `payments` DROP PRIMARY KEY,
    DROP COLUMN `payment_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `purchases` DROP PRIMARY KEY,
    DROP COLUMN `purchase_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `questions` DROP PRIMARY KEY,
    DROP COLUMN `question_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `registrations` DROP PRIMARY KEY,
    DROP COLUMN `registration_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `responses` DROP PRIMARY KEY,
    DROP COLUMN `response_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `tickets` DROP PRIMARY KEY,
    DROP COLUMN `ticket_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `user_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_organiser_id_fkey` FOREIGN KEY (`organiser_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_questions` ADD CONSTRAINT `event_questions_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_questions` ADD CONSTRAINT `event_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responses` ADD CONSTRAINT `responses_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responses` ADD CONSTRAINT `responses_eq_id_fkey` FOREIGN KEY (`eq_id`) REFERENCES `event_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
