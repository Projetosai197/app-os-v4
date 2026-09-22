interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/branding/logo-a5e-sistemas.png"
        alt="A5E Sistemas"
        className={compact
          ? "h-10 w-16 rounded-lg object-contain brightness-125 contrast-110 drop-shadow-[0_0_10px_rgba(14,165,233,0.45)]"
          : "h-16 w-24 rounded-xl object-contain brightness-125 contrast-110 drop-shadow-[0_0_14px_rgba(14,165,233,0.5)]"}
      />
    </div>
  );
}
