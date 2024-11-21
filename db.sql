CREATE DATABASE IF NOT EXISTS regimaster_db;
USE regimaster_db;

-- Core User table
CREATE TABLE IF NOT EXISTS `User`  (
  `user_id` integer PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(255),
  `last_name` varchar(255),
  `email` varchar(255),
  `phone_no` varchar(255),
  `role` varchar(255),
  `created_at` DATETIME,
  `password` varchar(255)
);

-- Event table
CREATE TABLE IF NOT EXISTS `Event` (
  `event_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `organiser_id` INTEGER,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(255),
  `event_start_date` DATE NOT NULL,
  `event_end_date` DATE NOT NULL,
  `event_start_time` TIME NOT NULL,
  `event_end_time` TIME NOT NULL,
  `status` ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`organiser_id`) REFERENCES `User` (`user_id`)
);

-- Registration table to connect users to events
CREATE TABLE IF NOT EXISTS `Registration`  (
  `registration_id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer,
  `event_id` integer,
  `status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  `registration_date` DATE,

  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
);

---------------------- Ticketing tables ----------------------
-- Ticket table
CREATE TABLE IF NOT EXISTS `Ticket` (
    `ticket_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `event_id` INTEGER,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `quantity_total` INTEGER NOT NULL,
    `quantity_sold` INTEGER DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
);

-- Ticket purchase table to store individual ticket purchases
CREATE TABLE IF NOT EXISTS `TicketPurchase` (
    `purchase_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `ticket_id` INTEGER,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10,2) NOT NULL,    -- Stored independently of Ticket.price
    `total_price` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`ticket_id`) REFERENCES `Ticket` (`ticket_id`),
    CONSTRAINT `check_total_price` CHECK (total_price = quantity * unit_price)
);

---------------------- Questionnaire tables ----------------------
-- Questionnaire table
CREATE TABLE IF NOT EXISTS `Questionnaire`  (
  `questionnaire_id` integer PRIMARY KEY AUTO_INCREMENT,
  `event_id` integer,
  `title` varchar(255),
  `status` ENUM('draft','active', 'closed') DEFAULT 'draft',
  `created_at` DATETIME,
  `updated_at` DATETIME

  FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
);

-- Individual questions within questionnaires
CREATE TABLE IF NOT EXISTS `Question` (
  `question_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `questionnaire_id` INTEGER,
  `question_text` TEXT,
  `question_type` ENUM('text', 'multiple_choice', 'checkbox', 'dropdown') DEFAULT 'text' NOT NULL,
  `is_required` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`questionnaire_id`) REFERENCES `Questionnaire` (`questionnaire_id`)
)

-- Options for multiple choice, checkbox and dropdown questions
CREATE TABLE IF NOT EXISTS `QuestionOption` (
  `option_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `question_id` INTEGER,
  `option_text` VARCHAR(255) NOT NULL,
  `order_index` INTEGER,

  FOREIGN KEY (`question_id`) REFERENCES `Question` (`question_id`)
)

-- Responses to questions
CREATE TABLE IF NOT EXISTS `QuestionResponse`  (
  `response_id` integer PRIMARY KEY AUTO_INCREMENT,
  `registration_id` integer,
  `question_id` integer,
  `response_text` TEXT,
  `selected_option_id` integer,
  `submitted_at` DATETIME

  FOREIGN KEY (`registration_id`) REFERENCES `Registration` (`registration_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
);

--- Payment table ---
CREATE TABLE IF NOT EXISTS `Payment` (
    `payment_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `purchase_id` INTEGER,
    `amount` DECIMAL(10,2) NOT NULL,
    `payment_method` VARCHAR(50),
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `transaction_id` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`purchase_id`) REFERENCES `TicketPurchase` (`purchase_id`)
);