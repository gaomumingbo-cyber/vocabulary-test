export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f7] px-5 py-12 text-gray-800 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-gray-200 pb-6">
          <p className="text-sm font-semibold tracking-widest text-[#426b52]">
            ABOUT LINGNOSIS
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#234532] sm:text-4xl">
            このサイトについて
          </h1>

          <p className="mt-4 text-base leading-8 text-gray-600">
            英語の仕組みを発見し、理解する。
          </p>
        </header>

        <section className="mt-8 space-y-4 text-sm leading-8 text-gray-700 sm:text-base">
          <h2 className="text-xl font-semibold text-[#234532]">
            暗記するだけでなく、規則性を発見する。
          </h2>

          <p>
            英語を学ぶとき、単語や文法の知識を一つずつ覚えることは大切です。
            しかし、それぞれの知識がどのようにつながっているのかを理解することで、
            英語をより深く読み解けるようになります。
          </p>

          <p>
            Lingnosisは、具体的な例から共通点や違いを見つけ、
            英語の仕組みを自分で理解していく学習を目指しています。
          </p>

          <h2 className="pt-4 text-xl font-semibold text-[#234532]">
            知識をつなげ、使える理解へ。
          </h2>

          <p>
            語彙・文法・読解などを個別の知識として学ぶだけでなく、
            それらを結びつけ、実際の英文を理解する力へとつなげていきます。
          </p>
        </section>

        <nav className="mt-10 border-t border-gray-200 pt-5">
          <a
            href="/"
            className="text-sm font-medium text-[#426b52] hover:underline"
          >
            ← トップページへ戻る
          </a>
        </nav>
      </div>
    </main>
  );
}
