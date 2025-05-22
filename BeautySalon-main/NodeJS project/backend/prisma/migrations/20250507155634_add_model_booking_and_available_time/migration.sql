/*
  Warnings:

  - You are about to drop the `Registration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_employeeID_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_userID_fkey";

-- AlterTable
ALTER TABLE "Servics" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 60;

-- DropTable
DROP TABLE "Registration";

-- CreateTable
CREATE TABLE "Booking" (
    "bookingID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "employeeID" INTEGER NOT NULL,
    "serviceID" INTEGER NOT NULL,
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingID")
);

-- CreateTable
CREATE TABLE "Availability" (
    "availabilityID" SERIAL NOT NULL,
    "employeeID" INTEGER NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("availabilityID")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceID_fkey" FOREIGN KEY ("serviceID") REFERENCES "Servics"("serviceID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;
