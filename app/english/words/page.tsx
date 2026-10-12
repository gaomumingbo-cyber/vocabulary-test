"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #cbd0c5",
  backgroundColor: "transparent",
  color: "#315640",
  fontSize: "13px",
  cursor: "pointer",
};

type Material = {
  id: number;
  name: string;
};

type ParsedWord = {
  number: number | null;
  word: string;
  meaning: string;
  lineNumber: number;
};

export default function WordsPage() {
  const router = useRouter();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [text, setText] = useState("");
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 参考書一覧を取得
  const loadMaterials = async () => {
    try {
      const response = await fetch("/api/english/materials");

      if (!response.ok) {
        throw new Error("参考書の読み込みに失敗しました。");
      }

      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "参考書の読み込みに失敗しました。"
      );
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // 新しい参考書を登録
  const handleAddMaterial = async () => {
    setError("");
    setMessage("");

    const name = newMaterialName.trim();

    if (!name) {
      setError("参考書名を入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/english/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "参考書の登録に失敗しました。"
        );
      }

      // 一覧を更新
      await loadMaterials();

      // 登録した参考書を自動選択
      setMaterialId(String(data.id));

      setNewMaterialName("");
      setIsAddingMaterial(false);
      setMessage(`「${data.name}」を登録しました。`);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "参考書の登録に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteMaterial = async () => {
    if (!materialId) {
      setError("削除する参考書を選択してください。");
      return;
    }

    const material = materials.find(
      (item) => String(item.id) === materialId
    );

    if (!material) {
      setError("参考書が見つかりません。");
      return;
    }

    const confirmed = window.confirm(
      `「${material.name}」を削除しますか？\n\nこの参考書に登録されている単語もすべて削除されます。`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/english/materials", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(materialId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "参考書の削除に失敗しました。"
        );
      }

      setMaterialId("");
      setParsedWords([]);
      await loadMaterials();

      setMessage(`「${material.name}」を削除しました。`);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "参考書の削除に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };
  // 単語入力を解析してプレビュー
  const handlePreview = async () => {
    setError("");
    setMessage("");
    setParsedWords([]);

    if (!materialId) {
      setError("参考書を選択してください。");
      return;
    }

    if (!text.trim()) {
      setError("単語を入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      // 現在の単語を取得して最大番号を調べる
      const response = await fetch(
        `/api/english/words?materialId=${materialId}`
      );

      if (!response.ok) {
        throw new Error("既存単語の読み込みに失敗しました。");
      }

      const existingWords = await response.json();

      const maxNumber =
        existingWords.length > 0
          ? Math.max(
              ...existingWords.map(
                (word: { number: number }) => word.number
              )
            )
          : 0;

      let nextNumber = maxNumber + 1;

      const lines = text
        .split(/\r?\n/)
        .map((line, index) => ({
          text: line.trim(),
          lineNumber: index + 1,
        }))
        .filter((line) => line.text);

      const result: ParsedWord[] = [];

      for (const line of lines) {
        let number: number | null = null;
        let content = line.text;

        // 行頭に番号がある場合
        //
        // 例：
        // 001　abandon　捨てる、断念する
        // 001 / abandon / 捨てる、断念する
        const numberMatch = content.match(/^(\d+)[ 　]+(.+)$/);

        if (numberMatch) {
          number = Number(numberMatch[1]);
          content = numberMatch[2].trim();
        } else {
          number = nextNumber;
          nextNumber++;
        }

        let word = "";
        let meaning = "";

        // まず全角スペースで区切る
        const fullWidthParts = content.split(/　+/);

        if (fullWidthParts.length >= 2) {
          word = fullWidthParts[0].trim();
          meaning = fullWidthParts.slice(1).join("　").trim();
        } else {
          // 全角スペースがなければ /
          const slashParts = content.split(/\s*\/\s*/);

          if (slashParts.length >= 2) {
            word = slashParts[0].trim();
            meaning = slashParts.slice(1).join(" / ").trim();
          }
        }

        if (!word || !meaning) {
          throw new Error(
            `${line.lineNumber}行目：単語と意味を全角スペースで区切ってください。`
          );
        }

        result.push({
          number,
          word,
          meaning,
          lineNumber: line.lineNumber,
        });
      }

      setParsedWords(result);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "入力内容の解析に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 登録
    const handleRegister = async () => {
    setError("");
    setMessage("");

    if (!materialId || parsedWords.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      // 既存単語を確認
      const response = await fetch(
        `/api/english/words?materialId=${materialId}`
      );

      if (!response.ok) {
        throw new Error(
          "既存単語の確認に失敗しました。"
        );
      }

      const existingWords = await response.json();

      const existingNumbers = new Set(
        existingWords.map(
          (word: { number: number }) => word.number
        )
      );

      const conflicts = parsedWords.filter(
        (word) =>
          word.number !== null &&
          existingNumbers.has(word.number)
      );

      let conflictMode: "skip" | "overwrite" = "skip";

      if (conflicts.length > 0) {
        const conflictNumbers = conflicts
          .map((word) =>
            String(word.number).padStart(3, "0")
          )
          .join("、");

        const overwrite = window.confirm(
          `以下の番号はすでに登録されています。\n\n${conflictNumbers}\n\n` +
            `「OK」→ 上書き\n` +
            `「キャンセル」→ スキップ`
        );

        conflictMode = overwrite
          ? "overwrite"
          : "skip";
      }

      const registerResponse = await fetch(
        "/api/english/words",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            words: parsedWords.map((word) => ({
              materialId: Number(materialId),
              number: word.number,
              word: word.word,
              meaning: word.meaning,
            })),
            conflictMode,
          }),
        }
      );

      const data = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(
          data.error ?? "単語の登録に失敗しました。"
        );
      }

      let resultMessage = `${data.count}件処理しました。`;

      if (data.overwritten > 0) {
        resultMessage += `（${data.overwritten}件上書き）`;
      }

      if (data.skipped > 0) {
        resultMessage += `（${data.skipped}件スキップ）`;
      }

      setMessage(resultMessage);

      setText("");
      setParsedWords([]);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "単語の登録に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };

 
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f7f2",
        color: "#252923",
        fontFamily:
          'Arial, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "28px 24px 64px",
        }}
      >

      
       <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          paddingBottom: "18px",
          borderBottom: "1px solid #d9dbd2",
        }}
      >
        <span
          style={{
            color: "#294936",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Lingnosis
        </span>

        <span
          style={{
            color: "#777d73",
            fontSize: "11px",
            letterSpacing: "0.12em",
          }}
        >
          ENGLISH / VOCABULARY
        </span>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "24px",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={secondaryButtonStyle}
        >
          ← ホーム
        </button>

        <button
          onClick={() => router.push("/english")}
          style={secondaryButtonStyle}
        >
          ← 英語学習メニュー
        </button>
      </nav>

      <section
        style={{
          padding: "36px 0 28px",
          borderBottom: "1px solid #d9dbd2",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            color: "#55745d",
            fontSize: "11px",
            letterSpacing: "0.16em",
          }}
        >
          WORD MANAGEMENT
        </p>

        <h1
          style={{
            margin: 0,
            color: "#294936",
            fontSize: "30px",
            fontWeight: 500,
          }}
        >
          単語登録
        </h1>

        <p
          style={{
            margin: "12px 0 0",
            color: "#62685f",
            fontSize: "14px",
            lineHeight: 1.8,
          }}
        >
          参考書を選び、単語と意味をまとめて登録できます。
        </p>
      </section>

      {/* 参考書 */}
      <section
        style={{
          marginTop: "32px",
          padding: "24px",
          backgroundColor: "#fffefa",
          border: "1px solid #d9dbd2",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 6px",
              color: "#55745d",
              fontSize: "11px",
              letterSpacing: "0.14em",
            }}
          >
            STUDY MATERIAL
          </p>
          <h2
            style={{
              margin: 0,
              color: "#294936",
              fontSize: "20px",
              fontWeight: 500,
            }}
          >
            参考書
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              color: "#62685f",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            登録する単語の参考書を選択してください。
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={materialId}
            onChange={(e) => {
              setMaterialId(e.target.value);
              setParsedWords([]);
              setError("");
              setMessage("");
            }}
            style={{
              flex: "1 1 260px",
              width: "100%",
              maxWidth: "400px",
              minWidth: 0,
              padding: "12px",
              border: "1px solid #cbd0c5",
              borderRadius: 0,
              backgroundColor: "#ffffff",
              color: "#252923",
              fontSize: "14px",
            }}
          >
            <option value="">参考書を選択してください</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setIsAddingMaterial(!isAddingMaterial);
              setError("");
              setMessage("");
            }}
            style={{
              padding: "12px 16px",
              border: "1px solid #315640",
              backgroundColor: "#315640",
              color: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ＋ 新しい参考書
          </button>

          <button
            type="button"
            onClick={handleDeleteMaterial}
            disabled={!materialId || isLoading}
            style={{
              padding: "12px 16px",
              border: "1px solid #cbd0c5",
              backgroundColor: "transparent",
              color: "#62685f",
              fontSize: "13px",
              cursor: !materialId || isLoading ? "default" : "pointer",
              opacity: !materialId || isLoading ? 0.5 : 1,
            }}
          >
            参考書を削除
          </button>

          <button
            type="button"
            onClick={() => router.push("/english/words/list")}
            style={{
              padding: "12px 16px",
              border: "1px solid #cbd0c5",
              backgroundColor: "transparent",
              color: "#315640",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            登録単語を見る →
          </button>
        </div>

        {/* 参考書新規登録 */}
        {isAddingMaterial && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              border: "1px solid #d9dbd2",
              backgroundColor: "#f8f7f2",
              maxWidth: "600px",
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                color: "#294936",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              新しい参考書を追加
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddMaterial();
                  }
                }}
                placeholder="参考書名"
                style={{
                  flex: "1 1 220px",
                  minWidth: 0,
                  padding: "12px",
                  border: "1px solid #cbd0c5",
                  borderRadius: 0,
                  backgroundColor: "#ffffff",
                  fontSize: "14px",
                }}
              />

              <button
                type="button"
                onClick={handleAddMaterial}
                disabled={isLoading}
                style={{
                  padding: "12px 22px",
                  border: "1px solid #315640",
                  backgroundColor: "#315640",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: isLoading ? "default" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                登録
              </button>

<button
  type="button"
  onClick={() => {
    setIsAddingMaterial(false);
    setNewMaterialName("");
    setError("");
    setMessage("");
  }}
  style={{
    padding: "12px 22px",
    border: "1px solid #cbd0c5",
    backgroundColor: "transparent",
    color: "#62685f",
    fontSize: "13px",
    cursor: "pointer",
  }}
>
  キャンセル
</button>

            </div>
          </div>
        )}
      </section>

      {/* 単語入力 */}
      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "#fffefa",
          border: "1px solid #d9dbd2",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 6px",
              color: "#55745d",
              fontSize: "11px",
              letterSpacing: "0.14em",
            }}
          >
            WORD ENTRY
          </p>
          <h2
            style={{
              margin: 0,
              color: "#294936",
              fontSize: "20px",
              fontWeight: 500,
            }}
          >
            単語・意味
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              color: "#62685f",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            単語と意味をまとめて入力し、登録内容を確認します。
          </p>
        </div>

        <div
          style={{
            marginBottom: "16px",
            padding: "16px 18px",
            backgroundColor: "#f8f7f2",
            borderLeft: "3px solid #55745d",
            color: "#62685f",
            fontSize: "13px",
            lineHeight: 1.9,
          }}
        >
          <p style={{ margin: "0 0 4px", color: "#294936", fontWeight: 600 }}>
            入力ルール
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>1行に1単語入力してください。</li>
            <li>番号は省略できます。省略した場合は自動で採番されます。</li>
            <li>
              単語と意味は<strong>全角スペース</strong>で区切ってください。
            </li>
            <li>英単語内の半角スペースはそのまま使用できます。</li>
          </ul>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`abandon　捨てる、断念する
ability　能力
give up　あきらめる
take care of　世話をする`}
          rows={12}
          style={{
            display: "block",
            width: "100%",
            padding: "16px",
            border: "1px solid #cbd0c5",
            borderRadius: 0,
            backgroundColor: "#ffffff",
            color: "#252923",
            fontSize: "15px",
            lineHeight: 1.9,
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={handlePreview}
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              border: "1px solid #315640",
              backgroundColor: "#315640",
              color: "#ffffff",
              fontSize: "14px",
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "処理中…" : "入力内容をプレビュー →"}
          </button>
        </div>
      </section>

      {/* メッセージ */}
      {error && (
        <p
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </p>
      )}

      {message && (
        <p
          style={{
            color: "green",
            marginTop: "20px",
          }}
        >
          {message}
        </p>
      )}

      {/* プレビュー */}
      {parsedWords.length > 0 && (
        <section style={{ marginTop: "40px" }}>
          <h2>登録内容</h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "10px",
                    width: "80px",
                  }}
                >
                  番号
                </th>

                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "10px",
                  }}
                >
                  英単語
                </th>

                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "10px",
                  }}
                >
                  意味
                </th>
              </tr>
            </thead>

            <tbody>
              {parsedWords.map((word, index) => (
                <tr key={index}>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {String(word.number).padStart(3, "0")}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "10px",
                    }}
                  >
                    {word.word}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "10px",
                    }}
                  >
                    {word.meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={handleRegister}
            disabled={isLoading}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              fontSize: "16px",
              cursor: isLoading ? "default" : "pointer",
            }}
          >
            この内容を登録する
          </button>
        </section>
       )}
      </div>
    </main>
  );
}