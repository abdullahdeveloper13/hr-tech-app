-- CreateTable
CREATE TABLE "public"."absents" (
    "id" SERIAL NOT NULL,
    "employeeId" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "markedBy" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ABSENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "absents_employeeId_key" ON "public"."absents"("employeeId");

-- CreateIndex
CREATE INDEX "absents_employeeId_idx" ON "public"."absents"("employeeId");

-- CreateIndex
CREATE INDEX "absents_date_idx" ON "public"."absents"("date");

-- CreateIndex
CREATE UNIQUE INDEX "absents_employeeId_date_key" ON "public"."absents"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "public"."absents" ADD CONSTRAINT "absents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."absents" ADD CONSTRAINT "absents_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
