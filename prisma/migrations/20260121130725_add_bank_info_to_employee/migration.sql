/*
  Warnings:

  - The `employeeId` column on the `employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."employees" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankAccountTitle" TEXT,
ADD COLUMN     "bankIban" TEXT,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeId_key" ON "public"."employees"("employeeId");
