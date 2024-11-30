CREATE DATABASE IF NOT EXISTS regimaster_db;
USE regimaster_db;

-- Core User table
CREATE TABLE IF NOT EXISTS `User` (
    `user_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone_no` VARCHAR(255),
    `role` ENUM('participant', 'organizer', 'admin') DEFAULT 'participant',
    `password` VARCHAR(255) NOT NULL,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
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
CREATE TABLE IF NOT EXISTS `Registration` (
    `registration_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `user_id` INTEGER,
    `event_id` INTEGER,
    `status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    `registration_date` DATETIME DEFAULT CURRENT_TIMESTAMP,

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
    `sales_start` DATETIME,
    `sales_end` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
);

-- Ticket purchase table to store individual ticket purchases
CREATE TABLE IF NOT EXISTS `TicketPurchase` (
    `purchase_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `registration_id` INTEGER,
    `ticket_id` INTEGER,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10,2) NOT NULL,    -- Stored independently of Ticket.price
    `total_price` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`registration_id`) REFERENCES `Registration` (`registration_id`),
    FOREIGN KEY (`ticket_id`) REFERENCES `Ticket` (`ticket_id`),

    CONSTRAINT `check_total_price` CHECK (total_price = quantity * unit_price)
);

---------------------- Questionnaire tables ----------------------
-- Questionnaire table
CREATE TABLE IF NOT EXISTS `Questionnaire` (
    `questionnaire_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `event_id` INTEGER,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `status` ENUM('draft','active', 'closed') DEFAULT 'draft',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
);

-- Individual questions within questionnaires
CREATE TABLE IF NOT EXISTS `Question` (
  `question_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `questionnaire_id` INTEGER,
  `question_text` TEXT,
  `question_type` ENUM('text', 'multiple_choice', 'checkbox', 'dropdown') DEFAULT 'text' NOT NULL,
  `is_required` BOOLEAN DEFAULT FALSE,
  `order_index` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`questionnaire_id`) REFERENCES `Questionnaire` (`questionnaire_id`)
);

-- Options for multiple choice, checkbox and dropdown questions
CREATE TABLE IF NOT EXISTS `QuestionOption` (
  `option_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `question_id` INTEGER,
  `option_text` VARCHAR(255) NOT NULL,
  `order_index` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (`question_id`) REFERENCES `Question` (`question_id`)
);

-- Responses to questions
CREATE TABLE IF NOT EXISTS `QuestionResponse`  (
  `response_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `registration_id` INTEGER,
    `question_id` INTEGER,
    `response_text` TEXT,
    `selected_option_id` INTEGER,
    `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (`registration_id`) REFERENCES `Registration` (`registration_id`),
  FOREIGN KEY (`question_id`) REFERENCES `Question` (`question_id`),
  FOREIGN KEY (`selected_option_id`) REFERENCES `QuestionOption` (`option_id`)
);

-- Payment table --- 
CREATE TABLE IF NOT EXISTS `Payment` (
    `payment_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `purchase_id` INTEGER,
    `amount` DECIMAL(10,2) NOT NULL,
    `payment_method` ENUM('credit_card', 'paypal', 'bank_transfer') NOT NULL,
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `transaction_id` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`purchase_id`) REFERENCES `TicketPurchase` (`purchase_id`)
);

-- Indexes for faster querying
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_ticket_event ON Ticket(event_id);  
CREATE INDEX idx_event_status ON Event(status);
CREATE INDEX idx_registration_status ON Registration(status);
CREATE INDEX idx_payment_status ON Payment(payment_status);

-- Triggers

DELIMITER //

-- Automatically update ticket quantities when purchased
CREATE TRIGGER after_ticket_purchase
AFTER INSERT ON TicketPurchase
FOR EACH ROW
BEGIN
    UPDATE Ticket 
    SET quantity_sold = quantity_sold + NEW.quantity
    WHERE ticket_id = NEW.ticket_id;
END;
//

-- Prevent selling more tickets than available
CREATE TRIGGER before_ticket_purchase
BEFORE INSERT ON TicketPurchase
FOR EACH ROW
BEGIN
    DECLARE tickets_available INT;
    
    SELECT (quantity_total - quantity_sold) INTO tickets_available
    FROM Ticket
    WHERE ticket_id = NEW.ticket_id;
    
    IF NEW.quantity > tickets_available THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough tickets available';
    END IF;
END;
//

DELIMITER ;