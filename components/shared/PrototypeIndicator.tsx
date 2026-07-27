import { FlaskConical } from "lucide-react";

export function PrototypeIndicator() {
  return (
    <div
      className="prototype-indicator"
      role="note"
      aria-label="Illustrative prototype. Institution names and statistics are illustrative."
    >
      <FlaskConical size={12} aria-hidden="true" />
      <strong>Illustrative Prototype</strong>
    </div>
  );
}
