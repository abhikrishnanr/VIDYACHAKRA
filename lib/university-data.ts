import { academicMilestones } from "./demo-data";
import type { AcademicMilestone } from "./types";

export type UniversityCalendarGroup = {
  title: string;
  description: string;
  eventIds: string[];
};

export const universityCalendarGroups: UniversityCalendarGroup[] = [
  {
    title: "Academic Activities",
    description: "Teaching, registration and the approved instructional window",
    eventIds: ["classes-commence", "course-registration", "last-working-day"],
  },
  {
    title: "Assessments",
    description: "Continuous assessment and student feedback milestones",
    eventIds: ["internal-assessment-1", "internal-assessment-2", "student-feedback"],
  },
  {
    title: "Examinations",
    description: "Registration, hall tickets and practical and theory examinations",
    eventIds: [
      "exam-registration",
      "hall-ticket-publication",
      "practical-examination",
      "semester-1-theory-examination",
    ],
  },
  {
    title: "Valuation and Results",
    description: "Valuation, grade approval and publication of results",
    eventIds: ["centralised-valuation", "grade-approval", "result-publication"],
  },
];

const milestoneMap = new Map(
  academicMilestones.map((milestone) => [milestone.id, milestone]),
);

export const universityCalendarSections = universityCalendarGroups.map((group) => ({
  ...group,
  events: group.eventIds
    .map((eventId) => milestoneMap.get(eventId))
    .filter((event): event is AcademicMilestone => Boolean(event)),
}));

export type CollegeAttention = "aligned" | "attention" | "pending";

export type UniversityCollege = {
  id: string;
  name: string;
  district: string;
  acknowledgement: string;
  readiness: string;
  lastMilestone: string;
  status: CollegeAttention;
};

export const sahyaColleges: UniversityCollege[] = [
  {
    id: "shsu-01",
    name: "Sahya College of Liberal Studies",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 18 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
  {
    id: "shsu-02",
    name: "Nilgiri College of Applied Sciences",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 18 Jul",
    readiness: "Evidence due",
    lastMilestone: "Course registration · Complete",
    status: "attention",
  },
  {
    id: "shsu-03",
    name: "Pamba Institute of Commerce",
    district: "Pathanamthitta",
    acknowledgement: "Acknowledged · 19 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Classes commenced · Complete",
    status: "aligned",
  },
  {
    id: "shsu-04",
    name: "Chalakudy College of Social Inquiry",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 19 Jul",
    readiness: "Awaiting principal",
    lastMilestone: "Course registration · Complete",
    status: "pending",
  },
  {
    id: "shsu-05",
    name: "Malampuzha School of Management",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 20 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
  {
    id: "shsu-06",
    name: "Athirappilly College of Natural Sciences",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 20 Jul",
    readiness: "Room plan incomplete",
    lastMilestone: "Classes commenced · Complete",
    status: "attention",
  },
  {
    id: "shsu-07",
    name: "Bharathapuzha College of Languages",
    district: "Malappuram",
    acknowledgement: "Acknowledged · 20 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
  {
    id: "shsu-08",
    name: "Nila Institute of Digital Studies",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 21 Jul",
    readiness: "Invigilator list due",
    lastMilestone: "Course registration · Complete",
    status: "attention",
  },
  {
    id: "shsu-09",
    name: "Kodungallur College of Heritage Studies",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 21 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Classes commenced · Complete",
    status: "aligned",
  },
  {
    id: "shsu-10",
    name: "Attappady College of Community Studies",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 22 Jul",
    readiness: "Connectivity review",
    lastMilestone: "Course registration · Evidence due",
    status: "attention",
  },
  {
    id: "shsu-11",
    name: "Peramangalam College of Commerce",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 22 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
  {
    id: "shsu-12",
    name: "Silent Valley College of Biosciences",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 22 Jul",
    readiness: "Awaiting principal",
    lastMilestone: "Classes commenced · Complete",
    status: "pending",
  },
  {
    id: "shsu-13",
    name: "Guruvayur College of Cultural Studies",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 23 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
  {
    id: "shsu-14",
    name: "Mannarkkad Institute of Teacher Education",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 23 Jul",
    readiness: "Seating plan due",
    lastMilestone: "Course registration · Complete",
    status: "attention",
  },
  {
    id: "shsu-15",
    name: "Kunnamkulam College of Technology",
    district: "Thrissur",
    acknowledgement: "Acknowledged · 23 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Classes commenced · Complete",
    status: "aligned",
  },
  {
    id: "shsu-16",
    name: "Ottapalam College of Public Affairs",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 24 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
  {
    id: "shsu-17",
    name: "Wadakkanchery Institute of Economics",
    district: "Thrissur",
    acknowledgement: "Awaiting response",
    readiness: "Not confirmed",
    lastMilestone: "Classes commenced · Complete",
    status: "pending",
  },
  {
    id: "shsu-18",
    name: "Shoranur College of Creative Practice",
    district: "Palakkad",
    acknowledgement: "Acknowledged · 24 Jul",
    readiness: "Exam plan confirmed",
    lastMilestone: "Course registration · Complete",
    status: "aligned",
  },
];

export const councilNotifications = [
  {
    id: "cn-1",
    date: "26 Jul",
    title: "Examination readiness confirmation opens",
    detail: "University response requested by 31 July 2026.",
  },
  {
    id: "cn-2",
    date: "24 Jul",
    title: "FYUGP Calendar Version 1.0 remains locked",
    detail: "Date changes require the formal change-control workflow.",
  },
  {
    id: "cn-3",
    date: "22 Jul",
    title: "Evidence guidance updated",
    detail: "District impact notes may accompany disruption evidence.",
  },
];

