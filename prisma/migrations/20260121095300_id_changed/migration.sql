/*
  Warnings:

  - The primary key for the `check_ins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `check_ins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `employees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `leave_balances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `leave_balances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `leave_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `leave_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `employeeId` on the `check_ins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `employees` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `employeeId` on the `leave_balances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `employeeId` on the `leave_requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."check_ins" DROP CONSTRAINT "check_ins_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."leave_balances" DROP CONSTRAINT "leave_balances_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."leave_requests" DROP CONSTRAINT "leave_requests_employeeId_fkey";

-- AlterTable
ALTER TABLE "public"."check_ins" DROP CONSTRAINT "check_ins_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."leave_balances" DROP CONSTRAINT "leave_balances_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."leave_requests" DROP CONSTRAINT "leave_requests_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."settings" DROP CONSTRAINT "settings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "public"."employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_leaveType_year_key" ON "public"."leave_balances"("employeeId", "leaveType", "year");

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."check_ins" ADD CONSTRAINT "check_ins_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_balances" ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
