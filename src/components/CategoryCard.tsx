import { getCategoryColorHex } from "@/lib/store";
import type { Category, Task } from "@/lib/store";

interface CategoryCardProps {
  category: Category;
  tasks: Task[];
  onClick: () => void;
}

export default function CategoryCard({ category, tasks, onClick }: CategoryCardProps) {
  const colorHex = getCategoryColorHex(category.color);
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <button onClick={onClick} className="card-game p-5 flex flex-col items-center justify-center gap-2 btn-press w-full aspect-square">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--input))" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={colorHex} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading font-bold text-lg">
          {completed}/{total}
        </div>
        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
      </div>
      <span className="font-heading font-bold text-sm">{category.name}</span>
    </button>
  );
}
