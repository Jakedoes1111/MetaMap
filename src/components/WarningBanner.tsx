interface WarningBannerProps {
  title: string;
  description: string;
  variant?: "unknown" | "privacy";
}

export const WarningBanner = ({
  title,
  description,
  variant = "unknown",
}: WarningBannerProps) => {
  const background =
    variant === "privacy"
      ? "bg-[hsl(var(--colour-conflict)/0.12)] border-[hsl(var(--colour-conflict))]"
      : "bg-[hsl(var(--colour-banner))] border-[hsl(var(--colour-neutral))]";
  return (
    <div
      role="status"
      className={`rounded-lg border px-4 py-3 text-sm text-foreground shadow-sm ${background}`}
    >
      <p className="font-semibold uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-sm text-foreground">{description}</p>
    </div>
  );
};
