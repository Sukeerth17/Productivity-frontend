import { 
  Star, Tag, Briefcase, Heart, Book, Leaf, Flame, Compass, Moon, Sun, 
  type LucideIcon 
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  tag: Tag,
  briefcase: Briefcase,
  heart: Heart,
  book: Book,
  leaf: Leaf,
  flame: Flame,
  compass: Compass,
  moon: Moon,
  sun: Sun,
};

export function CategoryIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name] || Tag;
  return <Icon className={className} style={style} />;
}
