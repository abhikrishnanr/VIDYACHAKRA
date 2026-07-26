import { FlaskConical } from "lucide-react";

export function PrototypeIndicator() {
  return (
    <div className="prototype-indicator" role="note">
      <FlaskConical size={12} aria-hidden="true" />
      <strong>Illustrative Prototype</strong>
      <span>Institution names and statistics shown in this prototype are illustrative.</span>
    </div>
  );
}
