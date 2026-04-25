import type { Category } from "@/app/_data/types";

type Props = {
  category: Pick<Category, "name" | "accentVar">;
  size?: "sm" | "md";
};

export function CategoryChip({ category, size = "sm" }: Props) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-hey-pill font-medium uppercase tracking-wider ${padding}`}
      style={{
        color: `var(${category.accentVar})`,
        backgroundColor: `var(${category.accentVar.replace(/--color-(.+)/, "--color-$1-bg")})`,
      }}
    >
      {category.name}
    </span>
  );
}
