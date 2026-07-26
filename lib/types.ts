export type ComplianceStatus = "on-track" | "attention" | "overdue" | "not-reported";

export type AcademicEvent = {
  id: string;
  title: string;
  category: "Academic" | "Examination" | "Governance" | "Holiday";
  start: string;
  end?: string;
  audience: string;
  status?: ComplianceStatus;
  owner: string;
};

export type InstitutionCompliance = {
  id: string;
  name: string;
  region: string;
  submission: string;
  variance: string;
  status: ComplianceStatus;
};

export type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  scope: string;
  timestamp: string;
  detail: string;
};
