import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const materialId = searchParams.get("materialId");
    const startNumber = searchParams.get("start");
    const endNumber = searchParams.get("end");

    const words = await prisma.englishWord.findMany({
      where: {
        ...(materialId
          ? {
              materialId: Number(materialId),
            }
          : {}),
        ...(startNumber && endNumber
          ? {
              number: {
                gte: Number(startNumber),
                lte: Number(endNumber),
              },
            }
          : {}),
      },
      include: {
        material: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const words = body.words;
    const conflictMode = body.conflictMode ?? "skip";

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "登録する単語がありません。" },
        { status: 400 }
      );
    }

    if (!["skip", "overwrite"].includes(conflictMode)) {
      return NextResponse.json(
        { error: "不正な登録方法です。" },
        { status: 400 }
      );
    }

    const normalizedWords = words.map((word) => ({
      materialId: Number(word.materialId),
      number: Number(word.number),
      word: String(word.word ?? "").trim(),
      meaning: String(word.meaning ?? "").trim(),
    }));

    for (const word of normalizedWords) {
      if (
        !Number.isInteger(word.materialId) ||
        word.materialId <= 0
      ) {
        return NextResponse.json(
          { error: "正しい教材IDを指定してください。" },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(word.number) ||
        word.number <= 0
      ) {
        return NextResponse.json(
          { error: "単語番号は1以上の整数で指定してください。" },
          { status: 400 }
        );
      }

      if (!word.word || !word.meaning) {
        return NextResponse.json(
          { error: "英単語と意味を入力してください。" },
          { status: 400 }
        );
      }
    }

    const materialIds = [
      ...new Set(
        normalizedWords.map((word) => word.materialId)
      ),
    ];

    const materials = await prisma.material.findMany({
      where: {
        id: {
          in: materialIds,
        },
      },
    });

    if (materials.length !== materialIds.length) {
      return NextResponse.json(
        { error: "存在しない教材が指定されています。" },
        { status: 400 }
      );
    }

    // 同じ教材・同じ番号が入力データ内に複数ないか確認
    const inputKeys = new Set<string>();

    for (const word of normalizedWords) {
      const key = `${word.materialId}-${word.number}`;

      if (inputKeys.has(key)) {
        return NextResponse.json(
          {
            error: `入力データ内で${word.number}番が重複しています。`,
          },
          { status: 400 }
        );
      }

      inputKeys.add(key);
    }

    const existingWords = await prisma.englishWord.findMany({
      where: {
        OR: normalizedWords.map((word) => ({
          materialId: word.materialId,
          number: word.number,
        })),
      },
    });

    const existingMap = new Map(
      existingWords.map((word) => [
        `${word.materialId}-${word.number}`,
        word,
      ])
    );

    const newWords = normalizedWords.filter(
      (word) =>
        !existingMap.has(
          `${word.materialId}-${word.number}`
        )
    );

    const conflictingWords = normalizedWords.filter(
      (word) =>
        existingMap.has(
          `${word.materialId}-${word.number}`
        )
    );

    // 上書き
    if (conflictMode === "overwrite") {
      for (const word of conflictingWords) {
        const existing = existingMap.get(
          `${word.materialId}-${word.number}`
        );

        if (!existing) {
          continue;
        }

        await prisma.englishWord.update({
          where: {
            id: existing.id,
          },
          data: {
            word: word.word,
            meaning: word.meaning,
          },
        });
      }
    }

    // 新規登録
    if (newWords.length > 0) {
      await prisma.englishWord.createMany({
        data: newWords,
      });
    }

    return NextResponse.json({
      success: true,
      count:
        newWords.length +
        (conflictMode === "overwrite"
          ? conflictingWords.length
          : 0),
      skipped:
        conflictMode === "skip"
          ? conflictingWords.length
          : 0,
      overwritten:
        conflictMode === "overwrite"
          ? conflictingWords.length
          : 0,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "単語の登録に失敗しました。" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "正しい単語IDを指定してください。" },
        { status: 400 }
      );
    }

    const word = await prisma.englishWord.findUnique({
      where: {
        id,
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: "単語が見つかりません。" },
        { status: 404 }
      );
    }

    await prisma.englishWord.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `「${word.word}」を削除しました。`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "単語の削除に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const number = Number(body.number);
    const word = String(body.word ?? "").trim();
    const meaning = String(body.meaning ?? "").trim();
    const materialId =
      body.materialId === undefined
        ? undefined
        : Number(body.materialId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "正しい単語IDを指定してください。" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(number) || number <= 0) {
      return NextResponse.json(
        { error: "通番には1以上の整数を入力してください。" },
        { status: 400 }
      );
    }

    if (!word || !meaning) {
      return NextResponse.json(
        { error: "英単語と意味を入力してください。" },
        { status: 400 }
      );
    }

    if (
      materialId !== undefined &&
      (!Number.isInteger(materialId) || materialId <= 0)
    ) {
      return NextResponse.json(
        { error: "正しい参考書を指定してください。" },
        { status: 400 }
      );
    }

    const existingWord = await prisma.englishWord.findUnique({
      where: { id },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: "単語が見つかりません。" },
        { status: 404 }
      );
    }

    const targetMaterialId =
      materialId ?? existingWord.materialId;

    const targetMaterial = await prisma.material.findUnique({
      where: { id: targetMaterialId },
    });

    if (!targetMaterial) {
      return NextResponse.json(
        { error: "指定された参考書が見つかりません。" },
        { status: 400 }
      );
    }

    const conflictingWord = await prisma.englishWord.findFirst({
      where: {
        materialId: targetMaterialId,
        number,
        NOT: { id },
      },
    });

    if (conflictingWord) {
      return NextResponse.json(
        {
          error: `この参考書では${number}番はすでに使用されています。`,
        },
        { status: 409 }
      );
    }

    const updatedWord = await prisma.englishWord.update({
      where: { id },
      data: {
        number,
        word,
        meaning,
        materialId: targetMaterialId,
      },
      include: {
        material: true,
      },
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "単語の更新に失敗しました。" },
      { status: 500 }
    );
  }
}
