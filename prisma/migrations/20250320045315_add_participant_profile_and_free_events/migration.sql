/*
  Warnings:

  - Added the required column `participant_id` to the `registrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `events` ADD COLUMN `is_free` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `registrations` ADD COLUMN `participant_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NULL,
    `date_of_birth` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NULL,

    INDEX `participants_city_state_country_idx`(`city`, `state`, `country`),
    UNIQUE INDEX `participants_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
