-- AlterTable
ALTER TABLE "Servics" ADD COLUMN     "categoryID" INTEGER;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "categoryID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("categoryID")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- AddForeignKey
ALTER TABLE "Servics" ADD CONSTRAINT "Servics_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "ServiceCategory"("categoryID") ON DELETE SET NULL ON UPDATE CASCADE;
