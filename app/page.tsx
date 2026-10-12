
"use client";

import { useRouter } from "next/navigation";

const menus = [
  {
    id: "vocabulary",
    code: "01",
    title: "語彙",
    englishTitle: "Vocabulary",
    description: "単語を登録し、出題範囲と問題数を指定してテストを作成する。",
    path: "/english",
    available: true,
  },
  {
    id: "grammar",
    code: "02",
    title: "文法",
    englishTitle: "Grammar",
    description: "英文の構造と規則性を理解し、演習を通して使い方を身につける。",
    path: "/grammar",
    available: false,
  },
  {
    id: "reading",
    code: "03",
    title: "読解",
    englishTitle: "Reading Comprehension",
    description: "英文の構造や修飾関係を整理し、文章の意味を読み解く。",
    path: "/reading",
    available: false,
  },
  {
    id: "phonology",
    code: "04",
    title: "音韻",
    englishTitle: "Phonology",
    description: "音素・音節・強勢・音のつながりから、英語の音の仕組みを学ぶ。",
    path: "/phonology",
    available: false,
  },
  {
    id: "listening",
    code: "05",
    title: "リスニング",
    englishTitle: "Listening",
    description: "英語の音声を聞き、単語や文の意味を理解する。",
    path: "/listening",
    available: false,
  },
  {
    id: "progress",
    code: "06",
    title: "学習履歴",
    englishTitle: "Learning Record",
    description: "テスト結果を振り返り、苦手な項目を復習につなげる。",
    path: "/english/test/history",
    available: true,
  },
];

export default function Home() {
  const router = useRouter();

  const goTo = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#252c27]">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
        <header className="border-b border-[#d9ddd5] pb-10 sm:pb-14">
          <div className="flex items-center justify-between">
            <a href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[#315640] text-sm font-semibold tracking-tight text-[#315640] transition-colors group-hover:bg-[#315640] group-hover:text-[#f8f7f2]">
                Ln
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.04em] text-[#294936]">
                  Lingnosis
                </p>
                <p className="mt-0.5 text-[9px] tracking-[0.2em] text-[#718174]">
                  ENGLISH LEARNING
                </p>
              </div>
            </a>

            <span className="hidden text-[10px] tracking-[0.18em] text-[#858b80] sm:block">
              LEARN · CONNECT · DISCOVER
            </span>
          </div>

          <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <p className="mb-5 text-xs font-medium tracking-[0.2em] text-[#58735e]">
                LANGUAGE AS A SYSTEM
              </p>

              <h1 className="max-w-2xl text-3xl font-medium leading-[1.5] tracking-[-0.055em] text-[#294936] sm:text-4xl md:text-[2.8rem]">
                英語の仕組みを発見し、
                <br className="hidden sm:block" />
                理解する。
              </h1>
            </div>

            <div className="md:pb-1">
              <p className="max-w-md text-sm leading-8 text-[#60685f]">
                単語・文法・読解を個別の知識で終わらせず、
                そのつながりから英語を自分で読み解く力を育てる。
              </p>

              <a
                href="/about"
                className="mt-5 inline-flex items-center gap-2 border-b border-[#8fa18f] pb-1 text-sm text-[#315640] transition-colors hover:border-[#315640]"
              >
                Lingnosisについて
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mt-10 flex h-8 items-center gap-2 overflow-hidden sm:mt-12"
          >
            <span className="h-px w-12 shrink-0 bg-[#315640]" />
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#315640]" />
            <span className="h-px w-8 shrink-0 bg-[#9cac9b]" />
            <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-[#78917a]" />
            <span className="h-px w-16 shrink-0 bg-[#9cac9b]" />
            <span className="h-px w-5 shrink-0 bg-[#315640]" />
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#315640]" />
            <span className="h-px w-24 shrink-0 bg-[#9cac9b]" />
            <span className="h-px w-8 shrink-0 bg-[#315640]" />
            <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-[#78917a]" />
            <span className="h-px w-20 shrink-0 bg-[#9cac9b]" />
            <span className="h-px w-10 shrink-0 bg-[#315640]" />
          </div>
        </header>

        <section className="pt-10 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] text-[#718174]">
                LEARNING AREAS
              </p>
              <h2 className="mt-2 text-xl font-medium tracking-tight text-[#294936] sm:text-2xl">
                学習する
              </h2>
            </div>

            <p className="text-xs leading-6 text-[#777e74]">
              興味のある分野から始めましょう。
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 border-t border-[#d9ddd5] sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-12">
            {menus.map((menu) => (
              <article
                key={menu.id}
                onClick={() => {
                  if (menu.available) goTo(menu.path);
                }}
                onKeyDown={(event) => {
                  if (
                    menu.available &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    goTo(menu.path);
                  }
                }}
                role={menu.available ? "link" : undefined}
                tabIndex={menu.available ? 0 : undefined}
                aria-label={
                  menu.available ? `${menu.title}を開く` : undefined
                }
                className={`group flex min-h-[190px] flex-col border-b border-[#d9ddd5] py-6 sm:py-7 ${
                  menu.available
                    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#315640]"
                    : "opacity-55"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs tabular-nums text-[#718174]">
                      {menu.code}
                    </span>
                    <h3 className="text-lg font-medium tracking-tight text-[#294936]">
                      {menu.title}
                    </h3>
                  </div>

                  {menu.available ? (
                    <span
                      aria-hidden="true"
                      className="text-lg text-[#718174] transition-transform group-hover:translate-x-1 group-hover:text-[#315640]"
                    >
                      ↗
                    </span>
                  ) : (
                    <span className="text-[10px] tracking-wider text-[#858b80]">
                      COMING SOON
                    </span>
                  )}
                </div>

                <p className="mt-2 pl-8 text-[10px] tracking-[0.12em] text-[#718174]">
                  {menu.englishTitle}
                </p>

                <p className="mt-4 pl-8 text-sm leading-7 text-[#60685f]">
                  {menu.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-20">
          <div className="border-t border-[#315640] pt-5">
            <p className="text-[10px] font-medium tracking-[0.2em] text-[#718174]">
              RESEARCH & DESIGN
            </p>

            <div
              role="link"
              tabIndex={0}
              aria-label="SLAガイドを開く"
              onClick={() => goTo("/sla")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goTo("/sla");
                }
              }}
              className="group mt-4 flex cursor-pointer flex-col gap-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315640] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="text-xl font-medium tracking-tight text-[#294936] sm:text-2xl">
                  SLAガイド
                </h2>
                <p className="mt-1 text-xs tracking-wide text-[#718174]">
                  Second Language Acquisition
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#60685f]">
                  第二言語習得研究の知見と、英語教材の設計への活かし方を紹介します。
                </p>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo("/sla");
                }}
                className="inline-flex min-h-11 w-fit shrink-0 items-center gap-5 border border-[#315640] px-5 py-3 text-sm font-medium text-[#315640] transition-colors hover:bg-[#315640] hover:text-[#f8f7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315640] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f7f2]"
              >
                ガイドを見る
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-16 flex flex-col gap-3 border-t border-[#d9ddd5] pt-5 text-xs text-[#858b80] sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium tracking-wide text-[#58735e]">
            Lingnosis
          </span>
          <span>英語の仕組みを発見し、理解する。</span>
        </footer>
      </div>
    </main>
  );
}
