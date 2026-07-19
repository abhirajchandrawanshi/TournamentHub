export default function Topbar() {
  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8">

      <h2 className="text-2xl font-bold">
        Player Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <span className="text-green-400 font-semibold">
          ₹500
        </span>

        <div className="w-10 h-10 rounded-full bg-green-500"></div>

      </div>

    </header>
  );
}