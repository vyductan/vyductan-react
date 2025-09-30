export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="relative w-full pt-1">
      <div className="mb-4 flex h-2 overflow-hidden rounded bg-blue-200 text-xs">
        <div
          style={{ width: `${value}%` }}
          className="flex flex-col justify-center bg-blue-500 text-center whitespace-nowrap text-white shadow-none transition-all duration-500 ease-in-out"
        />
      </div>
    </div>
  );
}
