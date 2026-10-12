-- CreateTable
CREATE TABLE "KanjiWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "kanji" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "writing" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KanjiWord_number_key" ON "KanjiWord"("number");
