-- Dream Vacation Planner — Database Schema
-- Run this once against your Amazon RDS MySQL instance.
--
-- From an EC2 terminal (or any machine that can reach RDS):
--   mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p < schema.sql
--
-- NOTE: this schema replaces any older version of this file that did not
-- have a "users" table. If you already loaded the old schema, drop the
-- database first (DROP DATABASE dream_vacation_planner;) and re-run this
-- file, since vacations now belong to a specific signed-in user.

CREATE DATABASE IF NOT EXISTS dream_vacation_planner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dream_vacation_planner;

CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(150)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vacations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT           NOT NULL,
  name           VARCHAR(100)  NOT NULL,
  destination    VARCHAR(150)  NOT NULL,
  budget         DECIMAL(10,2) NOT NULL,
  days           INT           NOT NULL,
  travel_month   VARCHAR(20)   NOT NULL,
  companions     ENUM('Solo', 'Family', 'Friends') NOT NULL,
  description    TEXT          NOT NULL,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vacations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_vacations_user_id ON vacations(user_id);

-- No sample rows this time: vacations now belong to a specific account,
-- so seed data would need a real user to attach to. Just sign up through
-- the app (POST /api/auth/signup, or the Sign Up page in the UI) and the
-- data you enter will be real, live rows tied to your new account.
