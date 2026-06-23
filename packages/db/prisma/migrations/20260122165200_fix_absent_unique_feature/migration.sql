/*
  Warnings:

  - The `employeeId` column on the `employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."absents_employeeId_key";

-- AlterTable
ALTER TABLE "public"."absents" ALTER COLUMN "employeeId" DROP DEFAULT;
DROP SEQUENCE "absents_employeeId_seq";

-- AlterTable
ALTER TABLE "public"."employees" DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeId_key" ON "public"."employees"("employeeId");
