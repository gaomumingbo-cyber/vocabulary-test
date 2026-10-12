import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const studentId = 1;

    const materials = await prisma.material.findMany({
      orderBy: { name: "asc" },
      include: {
        words: {
          select: {
            id: true,
          },
        },
      },
    });

    const questions = await prisma.testQuestion.findMany({
      where: {
        test: { studentId },
        answer: { isNot: null },
      },
      select: {
        englishWordId: true,
        answer: {
          select: {
            isCorrect: true,
            createdAt: true,
          },
        },
        englishWord: {
          select: {
            materialId: true,
            word: true,
            meaning: true,
          },
        },
      },
      orderBy: {
        answer: { createdAt: "desc" },
      },
    });

    const result = materials.map((material) => {
      const wordIds = new Set(material.words.map((word) => word.id));

      const wordHistory = new Map<
        number,
        {
          word: string;
          meaning: string;
          correctCount: number;
          incorrectCount: number;
          recentResults: boolean[];
        }
      >();

      for (const question of questions) {
        if (question.englishWord.materialId !== material.id) continue;
        if (!question.answer) continue;

        const id = question.englishWordId;
        const existing = wordHistory.get(id) ?? {
          word: question.englishWord.word,
          meaning: question.englishWord.meaning,
          correctCount: 0,
          incorrectCount: 0,
          recentResults: [],
        };

        if (question.answer.isCorrect) {
          existing.correctCount += 1;
        } else {
          existing.incorrectCount += 1;
        }

        if (existing.recentResults.length < 5) {
          existing.recentResults.push(question.answer.isCorrect);
        }

        wordHistory.set(id, existing);
      }

      const studiedWords = [...wordHistory.values()];

      const mastery = studiedWords.map((word) => {
        if (
          word.recentResults.length === 5 &&
          word.recentResults.every(Boolean)
        ) {
          return 100;
        }

        if (word.recentResults.length === 0) return 0;

        return Math.round(
          (word.recentResults.filter(Boolean).length /
            word.recentResults.length) *
            100
        );
      });

      const achievement =
        mastery.length > 0
          ? Math.round(
              mastery.reduce((sum, value) => sum + value, 0) /
                mastery.length
            )
          : 0;

      const weakWords = studiedWords
        .filter((word) => word.incorrectCount > 0)
        .sort((a, b) => b.incorrectCount - a.incorrectCount)
        .slice(0, 10);

      return {
        materialId: material.id,
        materialName: material.name,
        registeredWordCount: wordIds.size,
        studiedWordCount: wordHistory.size,
        coverage: wordIds.size
          ? Math.round((wordHistory.size / wordIds.size) * 100)
          : 0,
        achievement,
        weakWords,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "単語帳の進捗取得に失敗しました。" },
      { status: 500 }
    );
  }
}