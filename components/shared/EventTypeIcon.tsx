import {
  BookOpenCheck,
  CalendarCheck2,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  MessageSquareText,
  PenLine,
  ScanText,
  UserPlus,
} from "lucide-react";
import type { EventType } from "@/lib/types";

const eventIcons = {
  publication: FileCheck2,
  admission: UserPlus,
  instruction: GraduationCap,
  registration: ClipboardList,
  assessment: PenLine,
  feedback: MessageSquareText,
  examination: ScanText,
  valuation: BookOpenCheck,
  result: CalendarCheck2,
};

export function EventTypeIcon({
  type,
  size = 18,
}: {
  type: EventType;
  size?: number;
}) {
  const Icon = eventIcons[type];
  return <Icon size={size} aria-hidden="true" />;
}
