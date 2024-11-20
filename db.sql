CREATE DATABASE IF NOT EXISTS capstone_db;
USE capstone_db;

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

CREATE TABLE IF NOT EXISTS `Questionnaire_Response`  (
  `ques_response_id` integer PRIMARY KEY AUTO_INCREMENT,
  `questionnaire_id` integer,
  `user_id` integer,
  `response_data` varchar(255),
  `submitted_at` DATETIME
);

CREATE TABLE IF NOT EXISTS `Questionnaire`  (
  `questionnaire_id` integer PRIMARY KEY AUTO_INCREMENT,
  `event_id` integer,
  `title` varchar(255),
  `questionnaire_content` varchar(255)
);

CREATE TABLE IF NOT EXISTS `Event`  (
  `event_id` integer PRIMARY KEY AUTO_INCREMENT,
  `organiser_id` integer,
  `name` varchar(255),
  `event_start_date` DATE,
  `event_end_date` DATE,
  `event_start_time` TIME,
  `event_end_time` TIME,
  `location` varchar(255),
  `description` varchar(255),
  `event_image` varchar(255),
  `availiable_quantity` integer,
  `sales_start` DATE,
  `sales_end` DATE
);

CREATE TABLE IF NOT EXISTS `Registration`  (
  `registration_id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer,
  `event_id` integer,
  `registration_date` DATE,
  `registration_time` TIME,
  `status` enum('in_progress','approved')
);

CREATE TABLE IF NOT EXISTS `Payment`  (
  `payment_id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer,
  `ticket_id` integer,
  `amount` float,
  `payment_method` enum('method_1','method_2')
);
 
CREATE TABLE IF NOT EXISTS `Ticket`  (
  `ticket_id` integer PRIMARY KEY AUTO_INCREMENT,
  `event_id` integer,
  `type` varchar(255),
  `description` varchar(255),
  `price` float
);

ALTER TABLE `Questionnaire_Response` ADD FOREIGN KEY (`questionnaire_id`) REFERENCES `Questionnaire` (`questionnaire_id`);

ALTER TABLE `Questionnaire_Response` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `Questionnaire` ADD FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`);

ALTER TABLE `Event` ADD FOREIGN KEY (`organiser_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `Registration` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `Registration` ADD FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`);

ALTER TABLE `Payment` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `Payment` ADD FOREIGN KEY (`ticket_id`) REFERENCES `Ticket` (`ticket_id`);

ALTER TABLE `Ticket` ADD FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`);
