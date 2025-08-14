export function TeensITLogo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-6 w-auto",
    default: "h-8 w-auto", 
    large: "h-12 w-auto"
  };

  const logoSize = {
    small: { container: "w-6 h-6", accent: "w-3 h-3" },
    default: { container: "w-8 h-8", accent: "w-4 h-4" },
    large: { container: "w-12 h-12", accent: "w-6 h-6" }
  };

  const textSize = {
    small: "text-lg",
    default: "text-xl",
    large: "text-3xl"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className={`${logoSize[size].container} bg-teens-navy rounded-l-full`}></div>
        <div 
          className={`absolute top-0 right-0 ${logoSize[size].accent} bg-teens-red`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        ></div>
      </div>
      <span className={`ml-2 ${textSize[size]} font-bold text-teens-navy`}>
        EENS IT
      </span>
    </div>
  );
}
