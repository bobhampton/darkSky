/**
 * Application header component
 */
export function Header() {
  return (
    <header className="bg-white/2 backdrop-blur-[3px] bg-gray-900/60 border-2 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-lg mb-8">
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-blue-400 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">Dark Sky Calculator</h1>
        <p className="mt-3 text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Calculate the times when the center of the Sun is -18° below the horizon and there is no moon present in the sky
        </p>
      </div>
    </header>
  );
}
