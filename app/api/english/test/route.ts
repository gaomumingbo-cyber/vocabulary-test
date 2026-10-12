import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      questionCount,
      questions,
    } = body;

    if (
      !Number.isInteger(questionCount) ||
      questionCount <= 0
    ) {
      return NextResponse.json(
        { error: "問題数が正しくありません。" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "問題がありません。" },
        { status: 400 }
      );
    }

    if (questions.length !== questionCount) {
      return NextResponse.json(
        { error: "問題数と問題データが一致していません。" },
        { status: 400 }
      );
    }

    const englishWordIds = questions.map(
      (question) => Number(question.englishWordId)
    );

    if (
      englishWordIds.some(
        (id) => !Number.isInteger(id) || id <= 0
      )
    ) {
      return NextResponse.json(
        { error: "単語IDが正しくありません。" },
        { status: 400 }
      );
    }

    const uniqueIds = new Set(englishWordIds);

    if (uniqueIds.size !== englishWordIds.length) {
      return NextResponse.json(
        { error: "同じ単語が複数含まれています。" },
        { status: 400 }
      );
    }

    const words = await prisma.englishWord.findMany({
      where: {
        id: {
          in: englishWordIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (words.length !== englishWordIds.length) {
      return NextResponse.json(
        { error: "存在しない単語が含まれています。" },
        { status: 400 }
      );
    }

    /*
     * 現在は個人利用なので teacherId / studentId は
     * 仮の固定値を入れず、後で認証導入時に設定する。
     *
     * 現在の schema では Test に teacherId / studentId が
     * 必須なので、一旦既存の Teacher / Student が必要になる。
     */

    const teacher = await prisma.teacher.findFirst();

    if (!teacher) {
      return NextResponse.json(
        {
          error:
            "教師アカウントがまだ登録されていません。",
        },
        { status: 400 }
      );
    }

    let student = await prisma.student.findFirst({
      where: {
        teacherId: teacher.id,
      },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          teacherId: teacher.id,
          name: "自分用",
          publicToken: crypto.randomUUID(),
        },
      });
    }

    const test = await prisma.test.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        questionCount,
        questions: {
          create: questions.map(
            (
              question: {
                englishWordId: number;
              },
              index: number
            ) => ({
              englishWordId: Number(
                question.englishWordId
              ),
              questionNumber: index + 1,
            })
          ),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      success: true,
      testId: test.id,
      questions: test.questions,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "テストの保存に失敗しました。" },
      { status: 500 }
    );
  }
}