/*
  Warnings:

  - You are about to drop the column `positions` on the `Employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employees" DROP COLUMN "positions";

-- CreateTable
CREATE TABLE "EmployeesServiceCategories" (
    "employeeID" INTEGER NOT NULL,
    "serviceCategoryID" INTEGER NOT NULL,

    CONSTRAINT "EmployeesServiceCategories_pkey" PRIMARY KEY ("employeeID","serviceCategoryID")
);

-- AddForeignKey
ALTER TABLE "EmployeesServiceCategories" ADD CONSTRAINT "EmployeesServiceCategories_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeesServiceCategories" ADD CONSTRAINT "EmployeesServiceCategories_serviceCategoryID_fkey" FOREIGN KEY ("serviceCategoryID") REFERENCES "ServiceCategory"("categoryID") ON DELETE CASCADE ON UPDATE CASCADE;
