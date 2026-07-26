import Image from "next/image";
import Link from "next/link";

export function Brand({
  compact = false,
  inverse = false,
  href = "/",
}: {
  compact?: boolean;
  inverse?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`brand-lockup ${compact ? "brand-lockup-compact" : ""} ${
        inverse ? "brand-lockup-inverse" : ""
      }`}
      aria-label="VIDYACHAKRA home"
    >
      <Image
        src="/brand/vidyachakra-mark.svg"
        width={compact ? 38 : 46}
        height={compact ? 38 : 46}
        alt=""
      />
      <span className="brand-words">
        <strong>VIDYACHAKRA</strong>
        <span lang="ml">വിദ്യാചക്ര</span>
      </span>
    </Link>
  );
}
