import ModeSelector from "../components/ModeSelector";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-gray-900">
          Insta Layout
        </h1>
        <p className="text-sm text-gray-400">
          レイアウトを選んで画像を配置
        </p>
      </div>
      <div className="w-full max-w-md">
        <ModeSelector />
      </div>
    </div>
  );
}
