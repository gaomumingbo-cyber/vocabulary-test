"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f8f7f2",
  color: "#252923",
  fontFamily:
    'Arial, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
};

const containerStyle: React.CSSProperties = {
  maxWidth: "860px",
  margin: "0 auto",
  padding: "28px 24px 64px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 22px",
  border: "1px solid #315640",
  backgroundColor: "#315640",
  color: "#ffffff",
  fontSize: "14px",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #cbd0c5",
  backgroundColor: "transparent",
  color: "#315640",
  fontSize: "13px",
  cursor: "pointer",
};

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginTop: "8px",
  border: "1px solid #cbd0c5",
  borderRadius: 0,
  backgroundColor: "#fffefa",
  color: "#252923",
  fontSize: "15px",
};

const sectionStyle: React.CSSProperties = {
  padding: "22px 0",
  borderBottom: "1px solid #d9dbd2",
};

type Material = {
  id: number;
  name: string;
  sourceType: "SHARED" | "TEACHER_OWNED";
};

type EnglishWord = {
  id: number;
  materialId: number;
  number: number;
  word: string;
  meaning: string;
  material?: Material;
};

type MaterialRange = {
  materialId: number;
  startNumber: string;
  endNumber: string;
};

type GradingResult = {
  index: number;
  correct: boolean;
  reason: string;
};

export default function EnglishTestPage() {
  const router = useRouter();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialRanges, setMaterialRanges] = useState<MaterialRange[]>([]);

  const [questionCount, setQuestionCount] = useState("20");

  const [testWords, setTestWords] = useState<EnglishWord[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
const [testId, setTestId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const response = await fetch("/api/english/materials");

        if (!response.ok) {
          throw new Error("教材の読み込みに失敗しました。");
        }

        const data: Material[] = await response.json();

        setMaterials(data);

        if (data.length > 0) {
          setMaterialRanges([
            {
              materialId: data[0].id,
              startNumber: "",
              endNumber: "",
            },
          ]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

    const handleAddMaterial = () => {
    if (materials.length === 0) {
      alert("登録されている教材がありません。");
      return;
    }

    setMaterialRanges((current) => [
      ...current,
      {
        materialId: current.length > 0
          ? current[current.length - 1].materialId
          : materials[0].id,
        startNumber: "",
        endNumber: "",
      },
    ]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterialRanges((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const handleMaterialChange = (
    index: number,
    materialId: number
  ) => {
    setMaterialRanges((current) =>
      current.map((range, i) =>
        i === index
          ? {
              ...range,
              materialId,
            }
          : range
      )
    );
  };

  const handleRangeChange = (
    index: number,
    field: "startNumber" | "endNumber",
    value: string
  ) => {
    setMaterialRanges((current) =>
      current.map((range, i) =>
        i === index
          ? {
              ...range,
              [field]: value,
            }
          : range
      )
    );
  };

  const handleCreateTest = async () => {
    if (materialRanges.length === 0) {
      alert("教材を選択してください。");
      return;
    }

    const count = Number(questionCount);

    if (!Number.isInteger(count) || count <= 0) {
      alert("問題数を正しく入力してください。");
      return;
    }

    for (const range of materialRanges) {
      const start = Number(range.startNumber);
      const end = Number(range.endNumber);

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start <= 0 ||
        end <= 0 ||
        start > end
      ) {
        alert("教材ごとの番号範囲を正しく入力してください。");
        return;
      }
    }

    try {
      const allWords: EnglishWord[] = [];

      for (const range of materialRanges) {
        const response = await fetch(
          `/api/english/words?materialId=${range.materialId}&start=${range.startNumber}&end=${range.endNumber}`
        );

        if (!response.ok) {
          throw new Error("単語の読み込みに失敗しました。");
        }

        const words: EnglishWord[] = await response.json();

        allWords.push(...words);
      }

      if (allWords.length < count) {
        alert(
          `指定範囲内の単語は${allWords.length}件しかありません。問題数を${allWords.length}問以下にしてください。`
        );
        return;
      }

      const shuffled = [...allWords].sort(
        () => Math.random() - 0.5
      );

      const selectedWords = shuffled.slice(0, count);

// テストをDBに保存
const testResponse = await fetch("/api/english/test", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    questionCount: count,
    questions: selectedWords.map((word) => ({
      englishWordId: word.id,
    })),
  }),
});

const responseText = await testResponse.text();

console.log("テスト保存 API status:", testResponse.status);
console.log("テスト保存 API response:", responseText);

let testData;

try {
  testData = JSON.parse(responseText);
} catch {
  alert(
    `テストの保存に失敗しました。サーバー応答を確認してください（HTTP ${testResponse.status}）。`
  );
  return;
}

if (!testResponse.ok) {
  alert(testData.error ?? "テストの保存に失敗しました。");
  return;
}


if (!testResponse.ok) {
  alert(testData.error ?? "テストの保存に失敗しました。");
  return;
}

setTestId(testData.testId);
setTestWords(selectedWords);
setAnswers(new Array(count).fill(""));
setTestStarted(true);
setFinished(false);
setGradingResults([]);
    } catch (error) {
      console.error(error);
      alert("テストの作成に失敗しました。");
    }
  };

  const handleCreateWeakTest = async () => {
  const count = Number(questionCount);

  if (!Number.isInteger(count) || count <= 0) {
    alert("問題数を正しく入力してください。");
    return;
  }

  try {
    const response = await fetch("/api/english/weak-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: 1,
        questionCount: count,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error ?? "弱点テストの作成に失敗しました。");
      return;
    }

    const selectedWords: EnglishWord[] = data.words;

if (selectedWords.length < count) {
  alert(
    `現在の弱点語彙は${selectedWords.length}語です。\n${selectedWords.length}問でテストを作成します。`
  );
}
    setTestId(data.testId);
    setTestWords(selectedWords);
    setAnswers(new Array(selectedWords.length).fill(""));
    setTestStarted(true);
    setFinished(false);
    setGradingResults([]);
  } catch (error) {
    console.error(error);
    alert("弱点テストの作成に失敗しました。");
  }
};
 
  const handleAnswerChange = (
    index: number,
    value: string
  ) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
  if (!testId) {
    alert("テストIDがありません。");
    return;
  }

  try {
      const items = testWords.map((word, index) => ({
        index,
        word: word.word,
        meaning: word.meaning,
        answer: answers[index],
      }));

      const response = await fetch("/api/english/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  testId,
  items,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "採点に失敗しました。");
        return;
      }

      setGradingResults(data.results);
      setFinished(true);
    } catch (error) {
      console.error(error);
      alert("採点中にエラーが発生しました。");
    }
  };

  const handleRestart = () => {
    setTestId(null);
    setTestWords([]);
    setAnswers([]);
    setTestStarted(false);
    setFinished(false);
    setGradingResults([]);
  };

  if (finished) {
    const correctCount = gradingResults.filter(
      (result) => result.correct
    ).length;

    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <header
            style={{
              paddingBottom: "18px",
              borderBottom: "1px solid #d9dbd2",
              color: "#294936",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            Lingnosis
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
              TEST RESULTS
            </p>
            <h1
              style={{
                margin: 0,
                color: "#294936",
                fontSize: "30px",
                fontWeight: 500,
              }}
            >
              テスト結果
            </h1>
            <p
              style={{
                margin: "18px 0 0",
                color: "#62685f",
                fontSize: "15px",
              }}
            >
              {testWords.length}問中 {correctCount}問正解
            </p>
            <p
              style={{
                margin: "8px 0 0",
                color: "#294936",
                fontSize: "32px",
                fontWeight: 600,
              }}
            >
              {testWords.length > 0
                ? Math.round((correctCount / testWords.length) * 100)
                : 0}
              <span style={{ fontSize: "16px" }}>%</span>
            </p>
          </section>

          <div style={{ marginTop: "12px" }}>
            {testWords.map((word, index) => {
              const result = gradingResults[index];

              return (
                <section
                  key={word.id}
                  style={{
                    padding: "22px 0",
                    borderBottom: "1px solid #d9dbd2",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <span style={{ color: "#777d73", fontSize: "13px" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        color: result?.correct ? "#315640" : "#9b4b40",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {result?.correct ? "正解" : "不正解"}
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: "0 0 16px",
                      color: "#294936",
                      fontSize: "21px",
                      fontWeight: 600,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {word.word}
                  </h2>

                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    <span style={{ color: "#777d73" }}>あなたの回答：</span>
                    {result?.userAnswer ?? answers[index] ?? "（未回答）"}
                  </p>

                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    <span style={{ color: "#777d73" }}>正解：</span>
                    {result?.correctMeaning ?? word.meaning}
                  </p>

                  {result?.reason && (
                    <p
                      style={{
                        margin: "12px 0 0",
                        color: "#62685f",
                        fontSize: "13px",
                        lineHeight: 1.8,
                      }}
                    >
                      {result.reason}
                    </p>
                  )}
                </section>
              );
            })}
          </div>

          <button
            onClick={handleCreateTest}
            style={{
  ...primaryButtonStyle,
  marginTop: "28px",
  marginRight: "12px",
}}
          >
            同じ設定でもう一度テスト
          </button>


          <button
            onClick={handleRestart}
            style={{
              ...primaryButtonStyle,
              marginTop: "28px",
            }}
          >
            もう一度テストを作成
          </button>
        </div>
      </main>
    );
  }

      if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <header
            style={{
              paddingBottom: "18px",
              borderBottom: "1px solid #d9dbd2",
              color: "#294936",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            Lingnosis
          </header>

          <p
            style={{
              marginTop: "48px",
              color: "#62685f",
              fontSize: "14px",
            }}
          >
            教材を読み込み中...
          </p>
        </div>
      </main>
    );
  }

   if (testStarted) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
              padding: "36px 0 24px",
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
              VOCABULARY TEST
            </p>
            <h1
              style={{
                margin: 0,
                color: "#294936",
                fontSize: "30px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              英単語テスト
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                color: "#62685f",
                fontSize: "14px",
              }}
            >
              全 {testWords.length} 問
            </p>
          </section>

          <div style={{ marginTop: "12px" }}>
            {testWords.map((word, index) => (
              <div
                key={word.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0, 1fr)",
                  columnGap: "16px",
                  padding: "22px 0",
                  borderBottom: "1px solid #d9dbd2",
                }}
              >
                <span
                  style={{
                    paddingTop: "3px",
                    color: "#64816a",
                    fontSize: "13px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      marginBottom: "14px",
                      color: "#294936",
                      fontSize: "21px",
                      fontWeight: 600,
                      lineHeight: 1.5,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {word.word}
                  </div>

                  <label
                    style={{
                      display: "block",
                      color: "#62685f",
                      fontSize: "13px",
                    }}
                  >
                    意味
                    <input
                      type="text"
                      value={answers[index]}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      placeholder="日本語で入力"
                      style={fieldStyle}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              paddingTop: "28px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={handleSubmit}
              style={primaryButtonStyle}
            >
              採点する
            </button>
            <span
              style={{
                color: "#777d73",
                fontSize: "12px",
              }}
            >
              回答を確認してから採点してください。
            </span>
          </div>
        </div>
      </main>
    );
  }

    return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            VOCABULARY TEST
          </p>

          <h1
            style={{
              margin: 0,
              color: "#294936",
              fontSize: "30px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            英単語テスト作成
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#62685f",
              fontSize: "14px",
              lineHeight: 1.8,
            }}
          >
            教材と範囲を選んで、語彙の定着を確認しましょう。
          </p>
        </section>

      <div style={{ marginTop: "30px" }}>
        {materialRanges.map((range, index) => (
          <div
            key={`${range.materialId}-${index}`}
                        style={{
              borderTop: "1px solid #d9dbd2",
              padding: "24px 0",
              marginBottom: "0",
            }}
          >
            <label>
              教材
              <select
                value={range.materialId}
                onChange={(e) =>
                  handleMaterialChange(
                    index,
                    Number(e.target.value)
                  )
                }
                                style={fieldStyle}
              >
                {materials.map((material) => (
                  <option
                    key={material.id}
                    value={material.id}
                  >
                    {material.name}
                  </option>
                ))}
              </select>
            </label>

            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "15px",
              }}
            >
              <label style={{ flex: 1 }}>
                開始番号
                <input
                  type="number"
                  min="1"
                  value={range.startNumber}
                  onChange={(e) =>
                    handleRangeChange(
                      index,
                      "startNumber",
                      e.target.value
                    )
                  }
                  placeholder="001"
                  style={fieldStyle}
                />
              </label>

              <label style={{ flex: 1 }}>
                終了番号
                <input
                  type="number"
                  min="1"
                  value={range.endNumber}
                  onChange={(e) =>
                    handleRangeChange(
                      index,
                      "endNumber",
                      e.target.value
                    )
                  }
                  placeholder="100"
                  style={fieldStyle}
                />
              </label>
            </div>

            {materialRanges.length > 1 && (
              <button
                onClick={() =>
                  handleRemoveMaterial(index)
                }
                style={{
  ...secondaryButtonStyle,
  marginTop: "16px",
  color: "#777d73",
  borderColor: "#d9dbd2",
}}
              >
                この教材を削除
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAddMaterial}
          style={{
  ...secondaryButtonStyle,
  marginTop: "16px",
}}
        >
          ＋ 教材を追加
        </button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <label>
          問題数
          <input
            type="number"
            min="1"
            value={questionCount}
            onChange={(e) =>
              setQuestionCount(e.target.value)
            }
            style={{ ...fieldStyle, width: "120px" }}
          />
        </label>
      </div>
      <button
        onClick={handleCreateTest}
        style={{ ...primaryButtonStyle, marginTop: "24px" }}
      >
        テストを作成
      </button>

      <button
        onClick={handleCreateWeakTest}
        style={{
  ...secondaryButtonStyle,
  display: "block",
  marginTop: "12px",
}}
      >
        弱点語彙からテストを作成
         </button>
      </div>
    </main>
  );
}