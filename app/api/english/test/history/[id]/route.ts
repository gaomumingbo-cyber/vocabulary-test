import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testId = Number(id);

    if (!Number.isInteger(testId) || testId <= 0) {
      return NextResponse.json(
        { error: "テストIDが正しくありません。" },
        { status: 400 }
      );
    }

    const test = await prisma.test.findUnique({
      where: {
        id: testId,
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

    if (!test) {
      return NextResponse.json(
        { error: "指定されたテストが存在しません。" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: test.id,
      createdAt: test.createdAt,
      questionCount: test.questionCount,
      questions: test.questions,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "テスト詳細の取得に失敗しました。" },
      { status: 500 }
    );
  }
}