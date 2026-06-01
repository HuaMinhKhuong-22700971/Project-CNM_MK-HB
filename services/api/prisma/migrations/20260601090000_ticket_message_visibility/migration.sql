-- AlterTable
ALTER TABLE `ticket_messages`
  ADD COLUMN `visibility` VARCHAR(20) NOT NULL DEFAULT 'PUBLIC' AFTER `message`;
