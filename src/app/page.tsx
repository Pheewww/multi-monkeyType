import TypingTest from "@/components/TypingTest";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-[var(--color-text-dim)] text-sm mb-12 tracking-widest">
        monkeytype
      </h1>
      <TypingTest />
    </main>
  );
}
