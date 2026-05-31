-- Add missing columns to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS status ENUM('Available', 'Unavailable') DEFAULT 'Available';

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS service_name VARCHAR(100) NULL;
