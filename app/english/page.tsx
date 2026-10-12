"use client";

import { useRouter } from "next/navigation";

export default function EnglishPage() {
  const router = useRouter();

  const menus = [
    {
      number: "01",
      title: "テスト作成・受験",
      description: "教材と番号範囲を指定してテストを作成する",
      path: "/english/test",
    },
    {
      number: "02",
      title: "テスト履歴",
      description: "過去のテスト結果を確認する",
      path: "/english/test/history",
    },
    {
      number: "03",
      title: "単語登録",
      description: "教材と英単語・意味を登録する",
      path: "/english/words",
    },
    {
      number: "04",
      title: "登録済み単語一覧",
      description: "登録した単語の確認・編集・削除を行う",
      path: "/english/words/list",
    },
  ];

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
          maxWidth: "860px",
          margin: "0 auto",
          padding: "28px 24px 64px",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "18px",
            borderBottom: "1px solid #d9dbd2",
          }}
        >
          <button
            onClick={() => router.push("/")}
            aria-label="Lingnosisのホームへ戻る"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              padding: 0,
              border: "none",
              background: "transparent",
              color: "#294936",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid #315640",
                display: "grid",
                placeItems: "center",
                fontSize: "15px",
                letterSpacing: "-1px",
              }}
            >
              Ln
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              Lingnosis
            </span>
          </button>

          <span
            style={{
              color: "#73796f",
              fontSize: "11px",
              letterSpacing: "0.12em",
            }}
          >
            ENGLISH / VOCABULARY
          </span>
        </header>

        {/* Page introduction */}
        <section style={{ padding: "58px 0 38px" }}>
          <p
            style={{
              margin: "0 0 16px",
              color: "#52735b",
              fontSize: "12px",
              letterSpacing: "0.16em",
            }}
          >
            LEARN THROUGH DISCOVERY
          </p>

          <h1
            style={{
              margin: 0,
              color: "#294936",
              fontSize: "clamp(30px, 5vw, 42px)",
              fontWeight: 500,
              letterSpacing: "0.02em",
              lineHeight: 1.4,
            }}
          >
            語彙学習
          </h1>

          <p
            style={{
              maxWidth: "520px",
              margin: "18px 0 0",
              color: "#62685f",
              fontSize: "14px",
              lineHeight: 2,
            }}
          >
            単語を登録し、テストで理解を確かめる。
            <br />
            学習の目的に合わせて機能を選択してください。
          </p>
        </section>

        {/* Menu */}
        <section aria-label="語彙学習メニュー">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "12px",
              borderBottom: "1px solid #bfc7bb",
            }}
          >
            <span
              style={{
                color: "#52735b",
                fontSize: "11px",
                letterSpacing: "0.14em",
              }}
            >
              MENU
            </span>
            <span style={{ color: "#85897f", fontSize: "11px" }}>
              4 FUNCTIONS
            </span>
          </div>

          {menus.map((menu) => (
            <button
              key={menu.number}
              onClick={() => router.push(menu.path)}
              style={{
                display: "grid",
                gridTemplateColumns: "48px minmax(0, 1fr) 24px",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "23px 4px",
                border: "none",
                borderBottom: "1px solid #d9dbd2",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = "#efefe7";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span
                style={{
                  alignSelf: "start",
                  paddingTop: "3px",
                  color: "#64816a",
                  fontSize: "13px",
                  letterSpacing: "0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {menu.number}
              </span>

              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    color: "#294936",
                    fontSize: "17px",
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  {menu.title}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#73796f",
                    fontSize: "13px",
                    lineHeight: 1.8,
                  }}
                >
                  {menu.description}
                </span>
              </span>

              <span
                aria-hidden="true"
                style={{
                  justifySelf: "end",
                  color: "#52735b",
                  fontSize: "20px",
                }}
              >
                →
              </span>
            </button>
          ))}
        </section>

        {/* Footer */}
        <footer
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "12px",
            marginTop: "48px",
            paddingTop: "18px",
            borderTop: "1px solid #d9dbd2",
            color: "#777c72",
            fontSize: "11px",
            lineHeight: 1.8,
          }}
        >
          <span>Lingnosis</span>
          <span>英語の仕組みを発見し、理解する。</span>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              color: "#52735b",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            ← ホーム
          </button>
        </footer>
      </div>
    </main>
  );
}