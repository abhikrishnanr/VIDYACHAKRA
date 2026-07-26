import { institutions } from "./demo-data";
import type {
  CommitteeDecision,
  RequestStatus,
  RevisionPublicationState,
  Semester,
} from "./types";

export type MatrixStatus = "green" | "amber" | "red" | "grey";
export type MatrixCategory =
  | "Academic"
  | "Registration"
  | "Assessment"
  | "Examination"
  | "Valuation"
  | "Results";

export type MatrixMilestone = {
  id: string;
  label: string;
  shortLabel: string;
  category: MatrixCategory;
  semesters: Semester[];
  councilDate: string;
};

export type MatrixCell = {
  universityId: string;
  milestoneId: string;
  status: MatrixStatus;
  statusLabel: string;
  councilDate: string;
  scheduledDate: string | null;
  actualCompletionDate: string | null;
  variance: string;
  reason: string;
  requestStatus: RequestStatus | "none";
  requestId?: string;
  affectedCollegeCount: number;
  evidenceStatus: string;
  authorityReference: string;
};

export type MatrixWorkflowState = {
  requestStatus: RequestStatus;
  committeeDecision: CommitteeDecision;
  revisionPublicationState: RevisionPublicationState;
};

export const matrixMilestones: MatrixMilestone[] = [
  { id: "classes", label: "Classes Commence", shortLabel: "Classes", category: "Academic", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-08-03" },
  { id: "course-registration", label: "Course Registration", shortLabel: "Registration", category: "Registration", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-08-14" },
  { id: "internal-1", label: "Internal Assessment 1", shortLabel: "Internal 1", category: "Assessment", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-09-21" },
  { id: "internal-2", label: "Internal Assessment 2", shortLabel: "Internal 2", category: "Assessment", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-10-19" },
  { id: "last-working-day", label: "Last Working Day", shortLabel: "Last Day", category: "Academic", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-11-13" },
  { id: "practical", label: "Practical Examination", shortLabel: "Practical", category: "Examination", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-11-25" },
  { id: "theory", label: "Theory Examination", shortLabel: "Theory", category: "Examination", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-12-05" },
  { id: "valuation", label: "Valuation", shortLabel: "Valuation", category: "Valuation", semesters: ["Semester 1", "Semester 3"], councilDate: "2026-12-19" },
  { id: "results", label: "Results", shortLabel: "Results", category: "Results", semesters: ["Semester 1", "Semester 3"], councilDate: "2027-01-20" },
];

const amberCells: Record<string, string[]> = {
  sahya: ["practical", "valuation", "results"],
  vembanad: [],
  malabar: ["internal-2"],
  periyar: ["classes", "internal-1", "practical"],
  ananthapuri: [],
  kuttanad: ["classes", "internal-1", "last-working-day", "valuation"],
};

const greyCells: Record<string, string[]> = {
  sahya: [],
  vembanad: [],
  malabar: [],
  periyar: ["results"],
  ananthapuri: ["internal-2"],
  kuttanad: ["practical"],
};

function sahyaTheoryStatus(workflow: MatrixWorkflowState) {
  if (workflow.revisionPublicationState === "published") {
    return {
      status: "green" as const,
      label: "Approved exception",
      reason:
        "The seven-day institution-specific exception was approved by the Empowered Committee and published in Version 1.1.",
      evidence: "Approved evidence archived with Version 1.1",
    };
  }
  if (
    workflow.committeeDecision === "approved" ||
    workflow.requestStatus === "approved"
  ) {
    return {
      status: "amber" as const,
      label: "Pending publication",
      reason:
        "The Empowered Committee has approved the exception, but it is not official until Version 1.1 is published.",
      evidence: "Decision recorded · publication evidence pending",
    };
  }
  if (
    workflow.requestStatus !== "draft" &&
    workflow.requestStatus !== "rejected"
  ) {
    return {
      status: "amber" as const,
      label: "Under review",
      reason:
        "The change request has been submitted and the seven-day variance is under formal review.",
      evidence: "Monsoon impact bundle submitted for review",
    };
  }
  return {
    status: "red" as const,
    label:
      workflow.requestStatus === "rejected"
        ? "Rejected · uncorrected"
        : "Unauthorised deviation",
    reason:
      workflow.requestStatus === "rejected"
        ? "The request was rejected and the institution schedule has not been corrected."
        : "The university date is seven days beyond the approved Council baseline and the request remains a draft.",
    evidence:
      workflow.requestStatus === "rejected"
        ? "Rejection recorded · corrective schedule absent"
        : "Evidence bundle in preparation",
  };
}

export function buildMatrixCells(workflow: MatrixWorkflowState): MatrixCell[] {
  return institutions.flatMap((institution, institutionIndex) =>
    matrixMilestones.map((milestone, milestoneIndex) => {
      if (institution.id === "sahya" && milestone.id === "theory") {
        const dynamic = sahyaTheoryStatus(workflow);
        return {
          universityId: institution.id,
          milestoneId: milestone.id,
          status: dynamic.status,
          statusLabel: dynamic.label,
          councilDate: "2026-12-05",
          scheduledDate: "2026-12-12",
          actualCompletionDate: null,
          variance: "+7 days",
          reason: dynamic.reason,
          requestStatus: workflow.requestStatus,
          requestId: "CR-2026-014",
          affectedCollegeCount: 18,
          evidenceStatus: dynamic.evidence,
          authorityReference: "SHSU/EXAM/CAL/2026/77",
        };
      }

      const isGrey = greyCells[institution.id].includes(milestone.id);
      const isAmber = amberCells[institution.id].includes(milestone.id);
      const status: MatrixStatus = isGrey ? "grey" : isAmber ? "amber" : "green";
      const varianceDays =
        isAmber && milestone.id === "internal-2"
          ? 2
          : isAmber && milestone.id === "practical"
            ? 3
            : 0;
      const scheduledDate = isGrey
        ? null
        : new Date(
            new Date(`${milestone.councilDate}T12:00:00`).getTime() +
              varianceDays * 86400000,
          )
            .toISOString()
            .slice(0, 10);
      const completed =
        milestoneIndex < 2 && !isAmber && !isGrey
          ? scheduledDate
          : null;

      return {
        universityId: institution.id,
        milestoneId: milestone.id,
        status,
        statusLabel: isGrey ? "Not applicable" : isAmber ? "Attention" : "Aligned",
        councilDate: milestone.councilDate,
        scheduledDate,
        actualCompletionDate: completed,
        variance: isGrey ? "N/A" : varianceDays ? `+${varianceDays} days` : "No variance",
        reason: isGrey
          ? "This milestone does not apply to the selected institutional calendar."
          : isAmber
            ? "Readiness confirmation or supporting evidence is still awaited from the institution."
            : "The institution date matches the approved calendar or is covered by an approved exception.",
        requestStatus: isAmber && varianceDays ? "screening" : "none",
        requestId:
          isAmber && varianceDays
            ? `CR-2026-${String(8 + institutionIndex).padStart(3, "0")}`
            : undefined,
        affectedCollegeCount: isGrey ? 0 : institution.colleges.length,
        evidenceStatus: isGrey
          ? "Not required"
          : isAmber
            ? "Evidence incomplete"
            : completed
              ? "Completion evidence verified"
              : "Readiness confirmation received",
        authorityReference: `KSHEC/${milestone.category.toUpperCase()}/2026/${String(
          20 + milestoneIndex,
        ).padStart(2, "0")}`,
      };
    }),
  );
}

export function getInstitutionById(id: string) {
  return institutions.find((institution) => institution.id === id);
}
