import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const studentId = 1;

    const tests = await prisma.test.findMany({
      where: {
        studentId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        questions: {
          include: {
            answer: true,
            englishWord: true,
          },
          orderBy: {
            questionNumber: "asc",
          },
        },
      },
    });

    const history = tests.map((test) => {
      const answeredQuestions = test.questions.filter(
        (question) => question.answer !== null
      );

      const correctCount = answeredQuestions.filter(
        (question) => question.answer?.isCorrect === true
      ).length;

      return {
        id: test.id,
        createdAt: test.createdAt,
        questionCount: test.questionCount,
        answeredCount: answeredQuestions.length,
        correctCount,
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "テスト履歴の取得に失敗しました。" },
      { status: 500 }
    );
  }
}