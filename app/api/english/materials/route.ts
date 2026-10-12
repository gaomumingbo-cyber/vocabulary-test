import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "教材の読み込みに失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "教材名を入力してください。" },
        { status: 400 }
      );
    }

    const existingMaterial = await prisma.material.findFirst({
      where: {
        name,
        sourceType: "TEACHER_OWNED",
      },
    });

    if (existingMaterial) {
      return NextResponse.json(
        { error: "同じ名前の教材がすでに登録されています。" },
        { status: 409 }
      );
    }

    const material = await prisma.material.create({
      data: {
        name,
        sourceType: "TEACHER_OWNED",
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "教材の登録に失敗しました。" },
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
        { error: "正しい教材IDを指定してください。" },
        { status: 400 }
      );
    }

    const material = await prisma.material.findUnique({
      where: {
        id,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "教材が見つかりません。" },
        { status: 404 }
      );
    }

    // この教材に紐づく単語を削除
    await prisma.englishWord.deleteMany({
      where: {
        materialId: id,
      },
    });

    // 教材を削除
    await prisma.material.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `「${material.name}」を削除しました。`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "教材の削除に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const name = body.name?.trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "正しい教材IDを指定してください。" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "新しい教材名を入力してください。" },
        { status: 400 }
      );
    }

    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return NextResponse.json(
        { error: "教材が見つかりません。" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.material.findFirst({
      where: {
        name,
        sourceType: "TEACHER_OWNED",
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "同じ名前の教材がすでに登録されています。" },
        { status: 409 }
      );
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "教材名の変更に失敗しました。" },
      { status: 500 }
    );
  }
}

