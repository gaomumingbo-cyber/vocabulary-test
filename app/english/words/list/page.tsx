"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Material = {
  id: number;
  name: string;
};

type EnglishWord = {
  id: number;
  number: number;
  word: string;
  meaning: string;
  materialId: number;
  material: {
    id: number;
    name: string;
  };
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #cbd0c5",
  backgroundColor: "transparent",
  color: "#315640",
  fontSize: "13px",
  cursor: "pointer",
};

export default function WordListPage() {
  const router = useRouter();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWord, setEditWord] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editMaterialId, setEditMaterialId] = useState("");
  const [editMaterialName, setEditMaterialName] = useState("");
const [isRenamingMaterial, setIsRenamingMaterial] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const loadWords = async (selectedMaterialId: string) => {
    setError("");
    setIsLoading(true);

    try {
      const url = selectedMaterialId
        ? `/api/english/words?materialId=${selectedMaterialId}`
        : "/api/english/words";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("単語の読み込みに失敗しました。");
      }

      const data = await response.json();
      setWords(data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "単語の読み込みに失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
    loadWords("");
  }, []);

  const handleMaterialChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setMaterialId(value);
    setEditingId(null);
    setMessage("");
    await loadWords(value);
  };

  const handleStartEdit = (word: EnglishWord) => {
    setError("");
    setMessage("");
    setEditingId(word.id);
setEditNumber(String(word.number));
setEditWord(word.word);
setEditMeaning(word.meaning);
setEditMaterialId(String(word.materialId));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
setEditNumber("");
setEditWord("");
setEditMeaning("");
  };

  const handleSaveEdit = async (wordId: number) => {
    const trimmedWord = editWord.trim();
const trimmedMeaning = editMeaning.trim();
const parsedNumber = Number(editNumber);

if (
  !editNumber.trim() ||
  !Number.isInteger(parsedNumber) ||
  parsedNumber <= 0
) {
  setError("通番には1以上の整数を入力してください。");
  return;
}

    if (!trimmedWord || !trimmedMeaning) {
      setError("英単語と意味を入力してください。");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/english/words", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  id: wordId,
  number: parsedNumber,
  word: trimmedWord,
  meaning: trimmedMeaning,
  materialId: Number(editMaterialId),
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "単語の更新に失敗しました。"
        );
      }

      await loadWords(materialId);

      setEditingId(null);
      setEditWord("");
      setEditMeaning("");
      setMessage("単語を更新しました。");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "単語の更新に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWord = async (word: EnglishWord) => {
    const confirmed = window.confirm(
      `「${word.word}」を削除しますか？`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/english/words", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: word.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "単語の削除に失敗しました。"
        );
      }

      await loadWords(materialId);
      setMessage(`「${word.word}」を削除しました。`);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "単語の削除に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  
const handleRenameMaterial = async () => {
  if (!materialId) {
    setError("変更する参考書を選択してください。");
    return;
  }

  const trimmedName = editMaterialName.trim();

  if (!trimmedName) {
    setError("新しい参考書名を入力してください。");
    return;
  }

  setError("");
  setMessage("");

  try {
    const response = await fetch("/api/english/materials", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Number(materialId),
        name: trimmedName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "参考書名の変更に失敗しました。");
    }

    await loadMaterials();
    await loadWords(materialId);

    setIsRenamingMaterial(false);
    setMessage("参考書名を変更しました。");
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "参考書名の変更に失敗しました。"
    );
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

        <button
          type="button"
          onClick={() => router.push("/english/words")}
          style={secondaryButtonStyle}
        >
          単語登録へ戻る
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
          登録単語
        </h1>

        <p
          style={{
            margin: "12px 0 0",
            color: "#62685f",
            fontSize: "14px",
            lineHeight: 1.8,
          }}
        >
          登録済みの単語を確認・編集できます。
        </p>
            </section>

      <section style={{ marginTop: "30px" }}>
                <h2
          style={{
            margin: "0 0 12px",
            color: "#294936",
            fontSize: "17px",
            fontWeight: 600,
          }}
        >
          参考書
        </h2>

        <select
          value={materialId}
          onChange={handleMaterialChange}
                    style={{
            width: "100%",
            maxWidth: "500px",
            padding: "12px",
            border: "1px solid #cbd0c5",
            borderRadius: 0,
            backgroundColor: "#fffefa",
            color: "#252923",
            fontSize: "15px",
          }}
        >
          <option value="">すべての参考書</option>

          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>


{materialId && (
  <div style={{ marginTop: "12px", marginBottom: "20px" }}>
    {!isRenamingMaterial ? (
      <button
        type="button"
        onClick={() => {
          const selected = materials.find(
            (material) => String(material.id) === materialId
          );

          if (selected) {
            setEditMaterialName(selected.name);
            setIsRenamingMaterial(true);
            setError("");
            setMessage("");
          }
        }}
        style={secondaryButtonStyle}
      >
        参考書名を変更
      </button>
    ) : (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          value={editMaterialName}
          onChange={(e) => setEditMaterialName(e.target.value)}
          placeholder="新しい参考書名"
          style={{
            padding: "10px",
            border: "1px solid #cbd0c5",
            color: "#315640",
          }}
        />

        <button
          type="button"
          onClick={handleRenameMaterial}
          style={secondaryButtonStyle}
        >
          保存
        </button>

        <button
          type="button"
          onClick={() => setIsRenamingMaterial(false)}
          style={secondaryButtonStyle}
        >
          キャンセル
        </button>
      </div>
    )}
  </div>
)}


      </section>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {message && (
        <p style={{ color: "green", marginTop: "20px" }}>
          {message}
        </p>
      )}

      <section style={{ marginTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0 }}>単語一覧</h2>

          <span>
            {isLoading ? "読み込み中..." : `${words.length}件`}
          </span>
        </div>

        {words.length === 0 && !isLoading ? (
          <p>登録されている単語はありません。</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
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
                      textAlign: "left",
                    }}
                  >
                    英単語
                  </th>

                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "10px",
                      textAlign: "left",
                    }}
                  >
                    意味
                  </th>

                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "10px",
                      textAlign: "left",
                    }}
                  >
                    参考書
                  </th>

                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "10px",
                      width: "160px",
                    }}
                  >
                    操作
                  </th>
                </tr>
              </thead>

              <tbody>
                {words.map((word) => {
                  const isEditing = editingId === word.id;

                  return (
                    <tr key={word.id}>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                       {isEditing ? (
  <input
    type="number"
    min="1"
    step="1"
    value={editNumber}
    onChange={(e) => setEditNumber(e.target.value)}
    style={{
      width: "75px",
      padding: "8px",
      boxSizing: "border-box",
    }}
  />
) : (
  String(word.number).padStart(3, "0")
)}
                      </td>

                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "10px",
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editWord}
                            onChange={(e) =>
                              setEditWord(e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          word.word
                        )}
                      </td>

                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "10px",
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editMeaning}
                            onChange={(e) =>
                              setEditMeaning(e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          word.meaning
                        )}
                      </td>

                      <td>
  {editingId === word.id ? (
    <select
      value={editMaterialId}
      onChange={(e) => setEditMaterialId(e.target.value)}
      style={{
        padding: "8px",
        border: "1px solid #cbd0c5",
        backgroundColor: "#fff",
        color: "#315640",
        maxWidth: "180px",
      }}
    >
      {materials.map((material) => (
        <option key={material.id} value={String(material.id)}>
          {material.name}
        </option>
      ))}
    </select>
  ) : (
    word.material.name
  )}
</td>

                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "10px",
                        }}
                      >
                        {isEditing ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveEdit(word.id)
                              }
                              disabled={isLoading}
                              style={{
                                padding: "6px 10px",
                                cursor: isLoading
                                  ? "default"
                                  : "pointer",
                              }}
                            >
                              保存
                            </button>

                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                              style={{
                                padding: "6px 10px",
                                cursor: isLoading
                                  ? "default"
                                  : "pointer",
                              }}
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleStartEdit(word)
                              }
                              disabled={isLoading}
                              style={{
                                padding: "6px 10px",
                                cursor: isLoading
                                  ? "default"
                                  : "pointer",
                              }}
                            >
                              編集
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteWord(word)
                              }
                              disabled={isLoading}
                              style={{
                                padding: "6px 10px",
                                cursor: isLoading
                                  ? "default"
                                  : "pointer",
                              }}
                            >
                              削除
                            </button>
                          
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </div>
    </main>
  );
}
