/*
  Warnings:

  - A unique constraint covering the columns `[reference,number]` on the table `EnglishWord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EnglishWord_reference_number_key" ON "EnglishWord"("reference", "number");
