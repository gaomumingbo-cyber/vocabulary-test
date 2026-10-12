/*
  Warnings:

  - You are about to drop the column `reference` on the `EnglishWord` table. All the data in the column will be lost.
  - You are about to alter the column `number` on the `EnglishWord` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `materialId` to the `EnglishWord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EnglishWord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "teacherId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherMaterialPermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherMaterialPermission_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeacherMaterialPermission_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentMaterialPermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "startNumber" INTEGER NOT NULL,
    "endNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentMaterialPermission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentMaterialPermission_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Test_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Test_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testId" INTEGER NOT NULL,
    "englishWordId" INTEGER NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestQuestion_englishWordId_fkey" FOREIGN KEY ("englishWordId") REFERENCES "EnglishWord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testQuestionId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "gradingReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestAnswer_testQuestionId_fkey" FOREIGN KEY ("testQuestionId") REFERENCES "TestQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EnglishWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnglishWord_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EnglishWord" ("id", "meaning", "number", "word") SELECT "id", "meaning", "number", "word" FROM "EnglishWord";
DROP TABLE "EnglishWord";
ALTER TABLE "new_EnglishWord" RENAME TO "EnglishWord";
CREATE INDEX "EnglishWord_materialId_number_idx" ON "EnglishWord"("materialId", "number");
CREATE UNIQUE INDEX "EnglishWord_materialId_number_key" ON "EnglishWord"("materialId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_publicToken_key" ON "Student"("publicToken");

-- CreateIndex
CREATE INDEX "Student_teacherId_idx" ON "Student"("teacherId");

-- CreateIndex
CREATE INDEX "Material_teacherId_idx" ON "Material"("teacherId");

-- CreateIndex
CREATE INDEX "Material_sourceType_idx" ON "Material"("sourceType");

-- CreateIndex
CREATE INDEX "TeacherMaterialPermission_materialId_idx" ON "TeacherMaterialPermission"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherMaterialPermission_teacherId_materialId_key" ON "TeacherMaterialPermission"("teacherId", "materialId");

-- CreateIndex
CREATE INDEX "StudentMaterialPermission_studentId_materialId_idx" ON "StudentMaterialPermission"("studentId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentMaterialPermission_studentId_materialId_startNumber_endNumber_key" ON "StudentMaterialPermission"("studentId", "materialId", "startNumber", "endNumber");

-- CreateIndex
CREATE INDEX "Test_teacherId_idx" ON "Test"("teacherId");

-- CreateIndex
CREATE INDEX "Test_studentId_idx" ON "Test"("studentId");

-- CreateIndex
CREATE INDEX "TestQuestion_englishWordId_idx" ON "TestQuestion"("englishWordId");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_questionNumber_key" ON "TestQuestion"("testId", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_englishWordId_key" ON "TestQuestion"("testId", "englishWordId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAnswer_testQuestionId_key" ON "TestAnswer"("testQuestionId");
