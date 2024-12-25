/*
  Warnings:

  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questionnaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questionoption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questionresponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticketpurchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `Event_organiser_id_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_purchase_id_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_questionnaire_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionnaire` DROP FOREIGN KEY `Questionnaire_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionoption` DROP FOREIGN KEY `QuestionOption_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionresponse` DROP FOREIGN KEY `QuestionResponse_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionresponse` DROP FOREIGN KEY `QuestionResponse_registration_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionresponse` DROP FOREIGN KEY `QuestionResponse_selected_option_id_fkey`;

-- DropForeignKey
ALTER TABLE `registration` DROP FOREIGN KEY `Registration_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `registration` DROP FOREIGN KEY `Registration_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `ticketpurchase` DROP FOREIGN KEY `TicketPurchase_registration_id_fkey`;

-- DropForeignKey
ALTER TABLE `ticketpurchase` DROP FOREIGN KEY `TicketPurchase_ticket_id_fkey`;

-- DropTable
DROP TABLE `event`;

-- DropTable
DROP TABLE `payment`;

-- DropTable
DROP TABLE `question`;

-- DropTable
DROP TABLE `questionnaire`;

-- DropTable
DROP TABLE `questionoption`;

-- DropTable
DROP TABLE `questionresponse`;

-- DropTable
DROP TABLE `registration`;

-- DropTable
DROP TABLE `ticket`;

-- DropTable
DROP TABLE `ticketpurchase`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NULL,
    `role` ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'PARTICIPANT',
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `event_id` INTEGER NOT NULL AUTO_INCREMENT,
    `organiser_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `event_type` ENUM('SPORTS', 'MUSICAL', 'SOCIAL', 'VOLUNTEERING') NOT NULL,
    `start_datetime` DATETIME(3) NOT NULL,
    `end_datetime` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `question_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'DATE', 'EMAIL', 'PHONE') NOT NULL DEFAULT 'TEXT',
    `category` VARCHAR(191) NULL,
    `validation_rules` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_questions` (
    `event_question_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`event_question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `responses` (
    `response_id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `eq_id` INTEGER NOT NULL,
    `response_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`response_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registrations` (
    `registration_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `event_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `ticket_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity_total` INTEGER NOT NULL,
    `quantity_sold` INTEGER NOT NULL DEFAULT 0,
    `sales_start` DATETIME(3) NULL,
    `sales_end` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SOLD_OUT') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ticket_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `purchase_id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `ticket_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchases_registration_id_key`(`registration_id`),
    UNIQUE INDEX `purchases_ticket_id_key`(`ticket_id`),
    PRIMARY KEY (`purchase_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_id` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_purchase_id_key`(`purchase_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_organiser_id_fkey` FOREIGN KEY (`organiser_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_questions` ADD CONSTRAINT `event_questions_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_questions` ADD CONSTRAINT `event_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responses` ADD CONSTRAINT `responses_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`registration_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responses` ADD CONSTRAINT `responses_eq_id_fkey` FOREIGN KEY (`eq_id`) REFERENCES `event_questions`(`event_question_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`registration_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`ticket_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`purchase_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
