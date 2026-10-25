/*
  Warnings:

  - A unique constraint covering the columns `[inquiryNumber]` on the table `Inquiry` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "inquiryNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_inquiryNumber_key" ON "Inquiry"("inquiryNumber");
