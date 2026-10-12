"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

type EnglishWord = {
  id: number;
  materialId: number;
  number: number;
  word: string;
  meaning: string;
};

type TestAnswer = {
  id: number;
  testQuestionId: number;
  answer: string;
  isCorrect: boolean;
  gradingReason: string | null;
  createdAt: string;
};

type TestQuestion = {
  id: number;
  testId: number;
  englishWordId: number;
  questionNumber: number;
  answer: TestAnswer | null;
  englishWord: EnglishWord;
};

type TestDetail = {
  id: number;
  createdAt: string;
  questionCount: number;
  questions: TestQuestion[];
};

export default function EnglishTestHistoryDetailPage() {
 const router = useRouter();

  const params = useParams();
  const id = params.id;

  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadTest = async () => {
      try {
    const response = await fetch(
  `/api/english/test/history/${id}`
);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "テスト詳細の取得に失敗しました。"
          );
        }

        setTest(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "テスト詳細の取得に失敗しました。"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id]);

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        <p>テスト結果を読み込み中...</p>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        
        <h1>テスト結果</h1>
        <p>{error || "テストが見つかりません。"}</p>
      </main>
    );
  }

  const answeredQuestions = test.questions.filter(
    (question) => question.answer !== null
  );

  const correctCount = answeredQuestions.filter(
    (question) => question.answer?.isCorrect === true
  ).length;

  const percentage =
    test.questionCount > 0
      ? Math.round(
          (correctCount / test.questionCount) * 100
        )
      : 0;

  const date = new Date(test.createdAt);

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      
<div style={{ marginBottom: "20px" }}>
  <button
    onClick={() => router.push("/")}
    style={{
      padding: "8px 16px",
      cursor: "pointer",
    }}
  >
    ← ホームに戻る
  </button>

  <button
    onClick={() => router.push("/english")}
    style={{
      marginLeft: "10px",
      padding: "8px 16px",
      cursor: "pointer",
    }}
  >
    ← 英語学習メニューに戻る
  </button>
</div>
<button
  onClick={() => router.push("/english/test/history")}
  style={{
    marginLeft: "10px",
    padding: "8px 16px",
    cursor: "pointer",
  }}
>
  ← テスト履歴一覧に戻る
</button>

      <h1>テスト結果</h1>

      <p
        style={{
          marginTop: "15px",
          color: "#666",
        }}
      >
        {date.toLocaleString("ja-JP")}
      </p>

      <div
        style={{
          marginTop: "25px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <p
          style={{
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {test.questionCount}問中 {correctCount}問正解
        </p>

        <p
          style={{
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          正答率 {percentage}%
        </p>
      </div>

      <div style={{ marginTop: "30px" }}>
        {test.questions.map((question) => {
          const answer = question.answer;
          const word = question.englishWord;

          return (
            <div
              key={question.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
              }}
            >
              <p style={{ color: "#666" }}>
                {question.questionNumber}.{" "}
                {String(word.number).padStart(3, "0")}
              </p>

              <h2
                style={{
                  marginTop: "8px",
                }}
              >
                {word.word}
              </h2>

              <p
                style={{
                  marginTop: "15px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {answer?.isCorrect
                  ? "○ 正解"
                  : "× 不正解"}
              </p>

              <p style={{ marginTop: "15px" }}>
                あなたの回答：
                <br />
                <strong>
                  {answer?.answer || "（未回答）"}
                </strong>
              </p>

              <p style={{ marginTop: "15px" }}>
                正解：
                <br />
                <strong>{word.meaning}</strong>
              </p>

              {answer?.gradingReason && (
                <p
                  style={{
                    marginTop: "15px",
                    color: "#666",
                  }}
                >
                  {answer.gradingReason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
