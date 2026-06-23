-- AlterTable
ALTER TABLE "public"."employees" ALTER COLUMN "employeeId" DROP DEFAULT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT;
DROP SEQUENCE "employees_employeeId_seq";
