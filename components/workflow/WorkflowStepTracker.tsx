import {
  Check,
  CircleDot,
  Clock3,
  FileClock,
  LockKeyhole,
} from "lucide-react";
import type { WorkflowStage } from "@/lib/workflow-data";

export function WorkflowStepTracker({
  stages,
  compact = false,
}: {
  stages: WorkflowStage[];
  compact?: boolean;
}) {
  return (
    <ol
      className={`gov-step-tracker ${compact ? "compact" : ""}`}
      aria-label="Academic calendar change workflow"
    >
      {stages.map((stage) => (
        <li className={stage.state} key={stage.number}>
          <span className="gov-step-number">
            {stage.state === "complete" ? (
              <Check size={14} />
            ) : stage.state === "current" ? (
              <CircleDot size={14} />
            ) : (
              stage.number
            )}
          </span>
          <div>
            <small>Stage {stage.number}</small>
            <strong>{stage.label}</strong>
            {!compact ? (
              <>
                <span className="gov-step-role">
                  <LockKeyhole size={11} /> {stage.role}
                </span>
                <time>
                  {stage.date === "Pending" ? (
                    <Clock3 size={11} />
                  ) : (
                    <FileClock size={11} />
                  )}
                  {stage.date}
                </time>
                <p>{stage.audit}</p>
              </>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

