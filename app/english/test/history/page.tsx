
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TestHistory = {
  id: number;
  createdAt: string;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
};

type WordProgress = {
  word: string;
  meaning: string;
  correctCount: number;
  incorrectCount: number;
  recentResults: boolean[];
};

type MaterialProgress = {
  materialId: number;
  materialName: string;
  registeredWordCount: number;
  studiedWordCount: number;
  coverage: number;
  achievement: number;
  weakWords: WordProgress[];
};

const green = "#315640";
const muted = "#77796f";

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d5d8ce",
  borderRadius: "6px",
  background: "transparent",
  color: green,
  cursor: "pointer",
  fontSize: "13px",
};

const cardStyle: React.CSSProperties = {
  background: "#fffefa",
  border: "1px solid #e3e4da",
  borderRadius: "10px",
  padding: "16px",
};

function getPercentage(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnglishTestHistoryPage() {
  
const router = useRouter();

const [history, setHistory] = useState<TestHistory[]>([]);
const [progress, setProgress] = useState<MaterialProgress[]>([]);
const [trackPosition, setTrackPosition] = useState(0);
const [isSliding, setIsSliding] = useState(false);
const [transitionEnabled, setTransitionEnabled] = useState(true);

const changeMaterial = (direction: number) => {
  if (progress.length <= 1 || isSliding) return;

  setIsSliding(true);
  setTrackPosition((current) => current + direction);
};

const handleTrackTransitionEnd = () => {
  if (progress.length <= 1) {
    setIsSliding(false);
    return;
  }

  if (
    trackPosition < progress.length ||
    trackPosition >= progress.length * 2
  ) {
    setTransitionEnabled(false);
    setTrackPosition(
      progress.length + ((trackPosition % progress.length) + progress.length) % progress.length
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setIsSliding(false);
      });
    });
  } else {
    setIsSliding(false);
  }
};

const touchStartX = useRef<number | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const loadHistory = async () => {
    try {
      const response = await fetch("/api/english/test/history");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "テスト履歴の取得に失敗しました。"
        );
      }

      setHistory(data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "テスト履歴の取得に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  };

  loadHistory();
}, []);

useEffect(() => {
  const loadProgress = async () => {
    try {
      const response = await fetch("/api/english/test/progress");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "進捗の取得に失敗しました。"
        );
      }

      setProgress(data);
setTrackPosition(data.length);
    } catch (error) {
      console.error("進捗の取得に失敗しました。", error);
    }
  };

  loadProgress();
}, []);

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const chartHistory = [...sortedHistory]
    .reverse()
    .slice(-10);

  const totalQuestions = history.reduce(
    (sum, test) => sum + test.questionCount,
    0
  );

  const totalCorrect = history.reduce(
    (sum, test) => sum + test.correctCount,
    0
  );

  const totalAnswered = history.reduce(
    (sum, test) => sum + test.answeredCount,
    0
  );

  const overallPercentage = getPercentage(
    totalCorrect,
    totalQuestions
  );

  const completedTests = history.filter(
    (test) => test.answeredCount >= test.questionCount
  ).length;

  if (loading) {
    return (
     <main
  style={{
    width: "100%",
    maxWidth: "1200px",
    margin: "32px auto",
          padding: "0 20px",
          color: green,
        }}
      >
        履歴を読み込み中...
      </main>
    );
  }

  if (error) {
    return (
     <main
  style={{
    width: "100%",
    maxWidth: "1200px",
    margin: "32px auto",
          padding: "0 20px",
          color: green,
        }}
      >
        <h1>テスト履歴</h1>
        <p style={{ color: "#b42318" }}>{error}</p>
        <button
          style={buttonStyle}
          onClick={() => router.push("/english")}
        >
          英語学習メニューに戻る
        </button>
      </main>
    );
  }

  return (
   <main
  style={{
    width: "100%",
    maxWidth: "1200px",
    margin: "32px auto",
        padding: "0 20px 48px",
        color: "#30372f",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              color: muted,
              fontSize: "12px",
              letterSpacing: "0.12em",
              margin: "0 0 6px",
            }}
          >
            ENGLISH LEARNING
          </p>
          <h1
            style={{
              color: green,
              fontSize: "28px",
              margin: 0,
            }}
          >
            テスト履歴
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={buttonStyle}
            onClick={() => router.push("/")}
          >
            ホーム
          </button>
          <button
            style={buttonStyle}
            onClick={() => router.push("/english")}
          >
            英語学習メニュー
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{ ...cardStyle, padding: "32px 20px" }}>
          <p style={{ margin: 0, color: muted }}>
            まだテスト履歴がありません。
          </p>
        </div>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(145px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "受験回数",
                value: `${history.length}回`,
              },
              {
                label: "全体の正答率",
                value: `${overallPercentage}%`,
              },
              {
                label: "総正解数",
                value: `${totalCorrect}問`,
                sub: `全${totalQuestions}問`,
              },
              {
                label: "完了したテスト",
                value: `${completedTests}回`,
                sub: `回答済み ${totalAnswered}問`,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...cardStyle,
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    color: muted,
                    fontSize: "12px",
                    margin: "0 0 10px",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    color: green,
                    fontSize: "25px",
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {item.value}
                </p>
                {"sub" in item && (
                  <p
                    style={{
                      color: muted,
                      fontSize: "11px",
                      margin: "6px 0 0",
                    }}
                  >
                    {item.sub}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section
            style={{
              ...cardStyle,
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: green,
                  fontSize: "17px",
                  margin: 0,
                }}
              >
                正答率の推移
              </h2>
              <span style={{ color: muted, fontSize: "12px" }}>
                直近{chartHistory.length}回
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: "8px",
                height: "190px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  paddingBottom: "27px",
                  color: muted,
                  fontSize: "10px",
                }}
              >
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "stretch",
                  gap: "8px",
                  borderBottom: "1px solid #dfe2d8",
                  background:
                    "linear-gradient(to bottom, transparent 49.5%, #e9ebe4 50%, transparent 50.5%)",
                }}
              >
                {chartHistory.map((test) => {
                  const percentage = getPercentage(
                    test.correctCount,
                    test.questionCount
                  );

                  return (
                    <button
                      key={test.id}
                      title={`テスト #${test.id}：正答率${percentage}%`}
                      onClick={() =>
                        router.push(
                          `/english/test/history/${test.id}`
                        )
                      }
                      style={{
                        flex: 1,
                        minWidth: 0,
                        border: "none",
                        background: "transparent",
                        padding: "0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                        color: green,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {percentage}%
                      </span>
                      <div
                        style={{
                          width: "min(100%, 36px)",
                          height: `${Math.max(percentage, 2)}%`,
                          minHeight: "3px",
                          background: "#64846a",
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "10px",
                          color: muted,
                          height: "18px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        #{test.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p
              style={{
                color: muted,
                fontSize: "11px",
                margin: "12px 0 0",
              }}
            >
              棒を押すと、そのテストの詳細を確認できます。
            </p>
          </section>

<section style={{ marginTop: "32px" }}>
  <h2
    style={{
      color: green,
      fontSize: "20px",
      marginBottom: "14px",
    }}
  >
    単語帳別の学習進捗
  </h2>

  {progress.length === 0 ? (
    <p style={{ color: muted }}>
      まだ進捗データがありません。
    </p>
  ) : (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") changeMaterial(-1);
        if (event.key === "ArrowRight") changeMaterial(1);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const diff =
          touchStartX.current - event.changedTouches[0].clientX;

        if (diff > 50) changeMaterial(1);
        if (diff < -50) changeMaterial(-1);

        touchStartX.current = null;
      }}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "12px 0 20px",
        outline: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          left: `calc(${14 - 72 * trackPosition}% - ${12 * trackPosition}px)`,
          display: "flex",
          alignItems: "stretch",
          gap: "12px",
          transition: transitionEnabled
            ? "left 450ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
        }}
        onTransitionEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.propertyName === "left"
          ) {
            handleTrackTransitionEnd();
          }
        }}
      >
        {[...progress, ...progress, ...progress].map(
          (material, displayIndex) => {
            const isSelected = displayIndex === trackPosition;

            return (
              <div
                key={`${displayIndex}-${material.materialId}`}
                onClick={() => {
                  if (isSliding || isSelected) return;
                  setIsSliding(true);
                  setTrackPosition(displayIndex);
                }}
                style={{
                  ...cardStyle,
                  boxSizing: "border-box",
                  flex: "0 0 72%",
                  minWidth: 0,
                  opacity: isSelected ? 1 : 0.45,
                  transform: isSelected ? "scale(1)" : "scale(0.92)",
                  transition: "transform 450ms ease, opacity 450ms ease",
                  cursor: isSelected ? "default" : "pointer",
                  overflow: "hidden",
                }}
              >
                <h3
                  style={{
                    color: green,
                    fontSize: isSelected ? "17px" : "14px",
                    overflowWrap: "anywhere",
                    margin: "0 0 16px",
                  }}
                >
                  {material.materialName}
                </h3>

                {isSelected ? (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p style={{ color: muted, fontSize: "12px" }}>
                          達成度
                        </p>
                        <strong style={{ color: green, fontSize: "24px" }}>
                          {material.achievement}%
                        </strong>
                      </div>

                      <div>
                        <p style={{ color: muted, fontSize: "12px" }}>
                          出題カバー率
                        </p>
                        <strong style={{ color: green, fontSize: "24px" }}>
                          {material.coverage}%
                        </strong>
                      </div>

                      <div>
                        <p style={{ color: muted, fontSize: "12px" }}>
                          出題済み単語
                        </p>
                        <strong style={{ color: green, fontSize: "24px" }}>
                          {material.studiedWordCount}
                          <span style={{ fontSize: "13px", fontWeight: 400 }}>
                            {" "}/ {material.registeredWordCount}語
                          </span>
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        height: "7px",
                        background: "#e6e9e0",
                        borderRadius: "5px",
                        marginTop: "16px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${material.achievement}%`,
                          height: "100%",
                          background: "#64846a",
                          borderRadius: "5px",
                        }}
                      />
                    </div>

                    <h4
                      style={{
                        color: green,
                        fontSize: "14px",
                        margin: "22px 0 10px",
                      }}
                    >
                      苦手語彙 TOP 10
                    </h4>

                    {material.weakWords.length === 0 ? (
                      <p style={{ color: muted, fontSize: "13px" }}>
                        現在、苦手語彙はありません。
                      </p>
                    ) : (
                      <div>
                        {material.weakWords.map((word, index) => (
                          <div
                            key={`${material.materialId}-${word.word}`}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "24px minmax(0, 1fr) auto",
                              gap: "8px",
                              alignItems: "center",
                              padding: "10px 0",
                              borderTop: "1px solid #e3e4da",
                            }}
                          >
                            <span style={{ color: muted, fontSize: "12px" }}>
                              {index + 1}.
                            </span>

                            <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                              <strong style={{ color: "#30372f" }}>
                                {word.word}
                              </strong>
                              <p
                                style={{
                                  color: muted,
                                  fontSize: "12px",
                                  margin: "3px 0 0",
                                }}
                              >
                                {word.meaning}
                              </p>
                            </div>

                            <span
                              style={{
                                color: "#a34b3d",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              不正解 {word.incorrectCount}回
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p style={{ color: muted, fontSize: "12px" }}>達成度</p>
                    <strong style={{ color: green, fontSize: "22px" }}>
                      {material.achievement}%
                    </strong>

                    <div
                      style={{
                        height: "6px",
                        background: "#e6e9e0",
                        borderRadius: "5px",
                        marginTop: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${material.achievement}%`,
                          height: "100%",
                          background: "#64846a",
                        }}
                      />
                    </div>

                    <p
                      style={{
                        color: muted,
                        fontSize: "12px",
                        marginTop: "12px",
                      }}
                    >
                      出題済み {material.studiedWordCount}語
                    </p>
                    <p style={{ color: muted, fontSize: "12px" }}>
                      クリックして表示
                    </p>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {progress.length > 1 && (
        <>
          <button
            onClick={() => changeMaterial(-1)}
            disabled={isSliding}
            aria-label="前の単語帳"
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
              border: "1px solid #d9ded3",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              background: "#ffffff",
              color: green,
              cursor: "pointer",
              fontSize: "22px",
            }}
          >
            ‹
          </button>

          <button
            onClick={() => changeMaterial(1)}
            disabled={isSliding}
            aria-label="次の単語帳"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
              border: "1px solid #d9ded3",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              background: "#ffffff",
              color: green,
              cursor: "pointer",
              fontSize: "22px",
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  )}
  
<div
  style={{
    ...cardStyle,
    marginTop: "32px",
    overflow: "hidden",
  }}
>
              <h2
                style={{
                  color: green,
                  fontSize: "18px",
                  margin: 0,
                }}
              >
                受験履歴
              </h2>
              <span style={{ color: muted, fontSize: "12px" }}>
                {history.length}件
              </span>
            </div>

            <div
              style={{
                borderTop: "1px solid #e0e2d9",
              }}
            >
              {sortedHistory.map((test) => {
                const percentage = getPercentage(
                  test.correctCount,
                  test.questionCount
                );

                const isCompleted =
                  test.answeredCount >= test.questionCount;

                return (
                  <button
                    key={test.id}
                    onClick={() =>
                      router.push(
                        `/english/test/history/${test.id}`
                      )
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(0, 1fr) auto",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "15px 12px",
                      textAlign: "left",
                      border: "none",
                      borderBottom: "1px solid #e0e2d9",
                      background: "transparent",
                      color: "#30372f",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "5px",
                        }}
                      >
                        <strong
                          style={{
                            color: green,
                            fontSize: "15px",
                          }}
                        >
                          テスト #{test.id}
                        </strong>
                        {!isCompleted && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "3px 6px",
                              borderRadius: "4px",
                              background: "#f4ead5",
                              color: "#8a6424",
                            }}
                          >
                            未完了
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: muted,
                          margin: 0,
                        }}
                      >
                        {formatDate(test.createdAt)}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          margin: "6px 0 0",
                        }}
                      >
                        {test.correctCount}/{test.questionCount}問正解
                        {!isCompleted &&
                          ` · 回答済み ${test.answeredCount}問`}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          color: green,
                          fontSize: "22px",
                          fontWeight: 700,
                        }}
                      >
                        {percentage}%
                      </span>
                      <p
                        style={{
                          color: muted,
                          fontSize: "11px",
                          margin: "3px 0 0",
                        }}
                      >
                        詳細を見る →
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

    </main>
  );
}
