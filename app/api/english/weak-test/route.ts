import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const studentId = Number(body.studentId);
    const questionCount = Number(body.questionCount);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json(
        { error: "studentIdが正しくありません。" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(questionCount) || questionCount <= 0) {
      return NextResponse.json(
        { error: "問題数が正しくありません。" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "指定された生徒が存在しません。" },
        { status: 404 }
      );
    }

    // 生徒の過去の解答を新しい順に取得
    const answers = await prisma.testAnswer.findMany({
      where: {
        testQuestion: {
          test: {
            studentId,
          },
        },
      },
      include: {
        testQuestion: {
          include: {
            englishWord: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
    });

    // 各単語について「最新の回答」だけを残す
  const latestAnswers = new Map<
  number,
  {
    isCorrect: boolean;
    wrongCount: number;
    word: {
      id: number;
      materialId: number;
    };
  }
>();

    for (const answer of answers) {
  const word = answer.testQuestion.englishWord;

  const existing = latestAnswers.get(word.id);

  if (!existing) {
    latestAnswers.set(word.id, {
      isCorrect: answer.isCorrect,
      wrongCount: answer.isCorrect ? 0 : 1,
      word: {
        id: word.id,
        materialId: word.materialId,
      },
    });
  } else if (!answer.isCorrect) {
    existing.wrongCount += 1;
  }
}

    // 最新回答が不正解の単語だけを弱点語彙にする
    const weakWords = Array.from(latestAnswers.values())
  .filter((item) => !item.isCorrect)
  .sort((a, b) => {
    if (b.wrongCount !== a.wrongCount) {
      return b.wrongCount - a.wrongCount;
    }

    return Math.random() - 0.5;
  })
  .map((item) => item.word);

    if (weakWords.length === 0) {
      return NextResponse.json(
        { error: "現在、弱点語彙がありません。" },
        { status: 400 }
      );
    }

   const selectedWords = weakWords.slice(
  0,
  Math.min(questionCount, weakWords.length)
);

    const test = await prisma.test.create({
      data: {
        teacherId: student.teacherId,
        studentId: student.id,
        questionCount: selectedWords.length,
        questions: {
          create: selectedWords.map((word, index) => ({
            englishWordId: word.id,
            questionNumber: index + 1,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            questionNumber: "asc",
          },
        },
      },
    });

    const englishWords = await prisma.englishWord.findMany({
      where: {
        id: {
          in: selectedWords.map((word) => word.id),
        },
      },
      include: {
        material: true,
      },
    });

    const wordMap = new Map(
      englishWords.map((word) => [word.id, word])
    );

    const testWords = test.questions
      .map((question) =>
        wordMap.get(question.englishWordId)
      )
      .filter(
        (word): word is (typeof englishWords)[number] =>
          word !== undefined
      );

    return NextResponse.json({
      success: true,
      testId: test.id,
      questionCount: testWords.length,
      questions: test.questions,
      words: testWords,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "弱点テストの作成に失敗しました。" },
      { status: 500 }
    );
  }
}