import ModeSelector from "../components/ModeSelector";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-white">
          Insta Layout Editor
        </h1>
        <p className="text-lg text-gray-400">
          画像をドロップしてインスタ用にレイアウト編集
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <ModeSelector />
      </div>
    </div>
  );
}
