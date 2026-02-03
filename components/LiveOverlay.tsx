export default function LiveOverlay() {
  return (
    <div className="absolute top-2 left-2 bg-red-600/80 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 z-10">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      LIVE
    </div>
  );
}