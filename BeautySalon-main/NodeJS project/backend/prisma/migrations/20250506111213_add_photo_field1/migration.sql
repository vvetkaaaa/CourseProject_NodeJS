/*
  Warnings:

  - The `photo` column on the `Employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Employees" DROP COLUMN "photo",
ADD COLUMN     "photo" BYTEA;
