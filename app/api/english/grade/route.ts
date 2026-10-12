import OpenAI from "openai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const gradingMode = process.env.ENGLISH_GRADING_MODE ?? "mock";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const testId = Number(body.testId);
    const items = body.items;

    if (!Number.isInteger(testId) || testId <= 0) {
      return NextResponse.json(
        { error: "testIdが正しくありません。" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 }
      );
    }

    // =========================
    // テストの存在確認
    // =========================
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      include: {
  questions: {
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

    if (test.questions.length !== items.length) {
      return NextResponse.json(
        { error: "問題数と回答数が一致していません。" },
        { status: 400 }
      );
    }

    // =========================
    // MOCK採点
    // =========================
    if (gradingMode === "mock") {
      const results = items.map((item, index) => {
        const answer = String(item.answer ?? "").trim();
        const meaning = String(item.meaning ?? "").trim();

        const correct =
          answer !== "" &&
          meaning
            .split(/[、,，]/)
            .map((part) => part.trim())
            .some((part) => part === answer);

        return {
          index,
          correct,
          reason: correct
            ? "登録されている意味のいずれかと一致しています。"
            : "登録されている意味と一致していません。",
        };
      });

      // =========================
      // 採点結果をDBに保存
      // =========================
      await prisma.testAnswer.createMany({
        data: results.map((result) => ({
          testQuestionId: test.questions[result.index].id,
          answer: String(items[result.index].answer ?? "").trim(),
          isCorrect: result.correct,
          gradingReason: result.reason,
        })),
      });

      return NextResponse.json({
        results,
      });
    }

    
    // =========================
    // AI採点
    // =========================
    if (!openai) {
      return NextResponse.json(
        { error: "AI採点にはOPENAI_API_KEYの設定が必要です。" },
        { status: 500 }
      );
    }

    const response = await openai.responses.create({

      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
あなたは英単語テストの採点者です。

【最重要ルール】
採点基準は、各問題に登録されている「参考書の意味」だけです。
あなた自身の辞書知識から、新しい意味を追加してはいけません。

【採点ルール】
1. 回答が参考書の意味と意味的に同じなら正解。
2. 自然な言い換え・類義表現は正解として認める。
3. 日本語として多少表現が異なっていても、意味が同じなら正解。
4. 参考書の意味とは異なる意味なら不正解。
5. 空欄は不正解。
6. 複数の意味が「、」で登録されている場合、
   そのうち1つでも適切に答えられていれば正解。
7. 英単語そのものの一般的な意味を追加して、
   回答を正解扱いしてはいけません。
          `,
        },
        {
          role: "user",
          content: JSON.stringify(items),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "english_grading_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: {
                      type: "integer",
                    },
                    correct: {
                      type: "boolean",
                    },
                    reason: {
                      type: "string",
                    },
                  },
                  required: ["index", "correct", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.output_text);

    // =========================
    // 採点結果をDBに保存
    // =========================
    await prisma.testAnswer.createMany({
      data: result.results.map(
        (gradingResult: {
          index: number;
          correct: boolean;
          reason: string;
        }) => ({
          testQuestionId: test.questions[gradingResult.index].id,
          answer: String(
            items[gradingResult.index].answer ?? ""
          ).trim(),
          isCorrect: gradingResult.correct,
          gradingReason: gradingResult.reason,
        })
      ),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "採点に失敗しました。" },
      { status: 500 }
    );
  }
}