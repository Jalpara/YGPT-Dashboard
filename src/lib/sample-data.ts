export type EventStatus = "proposal" | "approved" | "in_progress" | "completed";

export type DriveFile = {
  name: string;
  url: string;
  mimeType?: string;
  updated?: string;
};

export type EventRecord = {
  code: string;
  title: string;
  city: string;
  month: string;
  date: string;
  startTime: string;
  duration: string;
  venue: string;
  objective: string;
  details: string;
  eventType: "Goal setting" | "Earth embrace" | "Acts of Love" | "Funday Event";
  proposalType: "Old Approved Event" | "New Event Proposal";
  estimatedParticipants: number;
  followUpDetails: string;
  lead: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  helperNames: string;
  budgetRequired: "Yes" | "No";
  budgetTotal: number;
  budgetJustification: string;
  socialFlyerNeeded: "Yes" | "No";
  socialFacebookEventNeeded: "Yes" | "No";
  socialContentNotes: string;
  socialDesignNotes: string;
  completionDate: string;
  startedOnTime: "Yes" | "No";
  delayReason: string;
  actualParticipants: number;
  interestCount: number;
  dataCaptured: "Yes" | "No";
  dataCaptureNotes: string;
  challenges: string;
  actualCost: number;
  donationAmount: number;
  donationDetails: string;
  eventWriteup: string;
  picturesSaved: "Yes" | "No";
  pictureNotes: string;
  socialTags: string;
  driveFiles?: {
    invoices: DriveFile[];
    media: DriveFile[];
    outreach: DriveFile[];
  };
  approvals?: {
    regional: {
      status: "Pending" | "Approved" | "Rejected" | "Need Changes";
      by: string;
      at: string;
      notes: string;
    };
    head: {
      status: "Pending" | "Approved" | "Rejected" | "Need Changes";
      by: string;
      at: string;
      notes: string;
    };
    accounts: {
      status: "Pending" | "Approved" | "Rejected" | "Need Changes";
      by: string;
      at: string;
      notes: string;
    };
    overall: "Pending" | "Approved" | "Rejected" | "Need Changes";
  };
  mode: "online" | "offline";
  status: EventStatus;
  budget: number;
  spent: number;
  invoices: number;
  photos: number;
  epfLink?: string;
  ecrLink?: string;
  epfUrl?: string;
  ecrUrl?: string;
  sheetLink?: string;
  driveFolder?: string;
};

export type InvoiceRecord = {
  id: string;
  eventCode: string;
  vendor: string;
  amount: number;
  status: "pending" | "paid" | "flagged";
  date: string;
};

export type PhotoRecord = {
  id: string;
  eventCode: string;
  caption: string;
  photographer: string;
  date: string;
};

export const events: EventRecord[] = [
  {
    code: "MUMFEB01",
    title: "Youth Service Leadership Summit",
    city: "Mumbai",
    month: "Feb",
    date: "2026-02-18",
    startTime: "10:00 AM",
    duration: "4 hours",
    venue: "City Convention Hall",
    objective: "Build leadership skills for local youth teams.",
    details: "Workshops, breakout sessions, and action planning.",
    eventType: "Acts of Love",
    proposalType: "New Event Proposal",
    estimatedParticipants: 120,
    followUpDetails: "Monthly check-in session with volunteers.",
    lead: "Ananya Rao",
    coordinatorName: "Ananya Rao",
    coordinatorPhone: "+91 98765 43210",
    coordinatorEmail: "ananya@ygpt.org",
    helperNames: "Rohit, Meera, Kavya",
    budgetRequired: "Yes",
    budgetTotal: 180000,
    budgetJustification: "Venue, materials, and logistics support.",
    socialFlyerNeeded: "Yes",
    socialFacebookEventNeeded: "Yes",
    socialContentNotes: "Highlight leadership theme and volunteer impact.",
    socialDesignNotes: "Use bold orange header with youth imagery.",
    completionDate: "2026-02-18",
    startedOnTime: "Yes",
    delayReason: "On schedule.",
    actualParticipants: 118,
    interestCount: 64,
    dataCaptured: "Yes",
    dataCaptureNotes: "Registration form captured on-site.",
    challenges: "No major issues reported.",
    actualCost: 91000,
    donationAmount: 15000,
    donationDetails: "Two donors contributed to workshop kits.",
    eventWriteup: "High-energy sessions with action plans and commitments.",
    picturesSaved: "Yes",
    pictureNotes: "Top 10 photos saved to Drive folder.",
    socialTags: "@ygptindia @localyouthhub",
    approvals: {
      regional: {
        status: "Approved",
        by: "Regional Lead",
        at: "2026-02-05",
        notes: "All details verified.",
      },
      head: {
        status: "Pending",
        by: "",
        at: "",
        notes: "",
      },
      accounts: {
        status: "Pending",
        by: "",
        at: "",
        notes: "",
      },
      overall: "Pending",
    },
    mode: "offline",
    status: "approved",
    budget: 180000,
    spent: 92000,
    invoices: 6,
    photos: 124,
    epfLink: "EPF-Response",
    ecrLink: "ECR-Response",
    epfUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform",
    ecrUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform",
    sheetLink: "EPF+ECR Master",
    driveFolder: "Drive/YGPT/MUMFEB01",
  },
  {
    code: "DELJAN02",
    title: "Community Health Outreach",
    city: "Delhi",
    month: "Jan",
    date: "2026-01-22",
    startTime: "9:30 AM",
    duration: "3 hours",
    venue: "Community Center, East Delhi",
    objective: "Provide health check-ups and awareness sessions.",
    details: "Medical camp + wellness talk.",
    eventType: "Earth embrace",
    proposalType: "Old Approved Event",
    estimatedParticipants: 80,
    followUpDetails: "Follow-up call with participants after 2 weeks.",
    lead: "Rahul Verma",
    coordinatorName: "Rahul Verma",
    coordinatorPhone: "+91 99887 77665",
    coordinatorEmail: "rahul@ygpt.org",
    helperNames: "Nisha, Harpreet",
    budgetRequired: "Yes",
    budgetTotal: 95000,
    budgetJustification: "Medical supplies and outreach material.",
    socialFlyerNeeded: "No",
    socialFacebookEventNeeded: "No",
    socialContentNotes: "Internal outreach only.",
    socialDesignNotes: "Not applicable.",
    completionDate: "2026-01-22",
    startedOnTime: "No",
    delayReason: "Clinic setup delayed by 20 minutes.",
    actualParticipants: 74,
    interestCount: 40,
    dataCaptured: "Yes",
    dataCaptureNotes: "Captured via QR registration form.",
    challenges: "Need more volunteers for crowd management.",
    actualCost: 91000,
    donationAmount: 0,
    donationDetails: "No donations received.",
    eventWriteup: "Health camp served 70+ community members.",
    picturesSaved: "Yes",
    pictureNotes: "Uploaded in shared drive album.",
    socialTags: "@ygptindia @communityhealth",
    mode: "offline",
    status: "completed",
    budget: 95000,
    spent: 91000,
    invoices: 4,
    photos: 78,
    epfLink: "EPF-Response",
    ecrLink: "ECR-Response",
    epfUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform",
    ecrUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform",
    sheetLink: "EPF+ECR Master",
    driveFolder: "Drive/YGPT/DELJAN02",
  },
  {
    code: "PUNMAR01",
    title: "Education Equity Workshop",
    city: "Pune",
    month: "Mar",
    date: "2026-03-09",
    startTime: "11:00 AM",
    duration: "2 hours",
    venue: "Virtual (Zoom)",
    objective: "Discuss equitable access to education resources.",
    details: "Panel discussion with educators.",
    eventType: "Goal setting",
    proposalType: "New Event Proposal",
    estimatedParticipants: 60,
    followUpDetails: "Share resource kit via email.",
    lead: "Meera Iyer",
    coordinatorName: "Meera Iyer",
    coordinatorPhone: "+91 90909 12121",
    coordinatorEmail: "meera@ygpt.org",
    helperNames: "Aman, Preeti",
    budgetRequired: "No",
    budgetTotal: 0,
    budgetJustification: "No budget required.",
    socialFlyerNeeded: "Yes",
    socialFacebookEventNeeded: "No",
    socialContentNotes: "Promote via LinkedIn post.",
    socialDesignNotes: "Use teal accent and webinar visuals.",
    completionDate: "2026-03-09",
    startedOnTime: "Yes",
    delayReason: "On schedule.",
    actualParticipants: 58,
    interestCount: 22,
    dataCaptured: "Yes",
    dataCaptureNotes: "Zoom registration list exported.",
    challenges: "Low audio quality in first 10 minutes.",
    actualCost: 0,
    donationAmount: 0,
    donationDetails: "No donations received.",
    eventWriteup: "Insightful panel with strong engagement.",
    picturesSaved: "No",
    pictureNotes: "Screenshots not captured.",
    socialTags: "@ygptindia @eduequity",
    mode: "online",
    status: "proposal",
    budget: 120000,
    spent: 0,
    invoices: 0,
    photos: 0,
    epfLink: "EPF-Response",
    ecrLink: "ECR-Response",
    epfUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform",
    ecrUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform",
    sheetLink: "EPF+ECR Master",
    driveFolder: "Drive/YGPT/PUNMAR01",
  },
  {
    code: "RPRFEB02",
    title: "Skill Building Meetup",
    city: "Raipur",
    month: "Feb",
    date: "2026-02-27",
    startTime: "3:00 PM",
    duration: "2.5 hours",
    venue: "Youth Center, Raipur",
    objective: "Skill training session for youth volunteers.",
    details: "Hands-on training and mentoring.",
    eventType: "Funday Event",
    proposalType: "New Event Proposal",
    estimatedParticipants: 45,
    followUpDetails: "Feedback survey after the event.",
    lead: "Nikhil Das",
    coordinatorName: "Nikhil Das",
    coordinatorPhone: "+91 98989 45678",
    coordinatorEmail: "nikhil@ygpt.org",
    helperNames: "Sana, Dev, Lata",
    budgetRequired: "Yes",
    budgetTotal: 65000,
    budgetJustification: "Trainer honorarium and materials.",
    socialFlyerNeeded: "Yes",
    socialFacebookEventNeeded: "Yes",
    socialContentNotes: "Focus on skill outcomes.",
    socialDesignNotes: "Use yellow accents and icons.",
    completionDate: "2026-02-27",
    startedOnTime: "Yes",
    delayReason: "On schedule.",
    actualParticipants: 42,
    interestCount: 19,
    dataCaptured: "No",
    dataCaptureNotes: "No registration form used.",
    challenges: "Need more seating next time.",
    actualCost: 29000,
    donationAmount: 5000,
    donationDetails: "Local sponsor donated refreshments.",
    eventWriteup: "Hands-on skill practice with strong feedback.",
    picturesSaved: "Yes",
    pictureNotes: "Uploaded to shared drive.",
    socialTags: "@ygptindia @raipurvolunteers",
    mode: "offline",
    status: "in_progress",
    budget: 65000,
    spent: 29000,
    invoices: 2,
    photos: 34,
    epfLink: "EPF-Response",
    ecrLink: "ECR-Response",
    epfUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform",
    ecrUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform",
    sheetLink: "EPF+ECR Master",
    driveFolder: "Drive/YGPT/RPRFEB02",
  },
];

export const invoices: InvoiceRecord[] = [
  {
    id: "INV-2391",
    eventCode: "MUMFEB01",
    vendor: "City Convention Hall",
    amount: 42000,
    status: "paid",
    date: "2026-02-02",
  },
  {
    id: "INV-2395",
    eventCode: "MUMFEB01",
    vendor: "PrintWorks",
    amount: 12500,
    status: "pending",
    date: "2026-02-05",
  },
  {
    id: "INV-2287",
    eventCode: "DELJAN02",
    vendor: "Sunrise Caterers",
    amount: 38000,
    status: "paid",
    date: "2026-01-18",
  },
  {
    id: "INV-2289",
    eventCode: "DELJAN02",
    vendor: "Metro Transport",
    amount: 11000,
    status: "flagged",
    date: "2026-01-20",
  },
  {
    id: "INV-2403",
    eventCode: "RPRFEB02",
    vendor: "StageCraft",
    amount: 19000,
    status: "pending",
    date: "2026-02-01",
  },
];

export const photos: PhotoRecord[] = [
  {
    id: "PH-1001",
    eventCode: "MUMFEB01",
    caption: "Opening circle and introductions",
    photographer: "Team Media",
    date: "2026-02-18",
  },
  {
    id: "PH-1005",
    eventCode: "MUMFEB01",
    caption: "Workshop breakouts",
    photographer: "Team Media",
    date: "2026-02-18",
  },
  {
    id: "PH-0931",
    eventCode: "DELJAN02",
    caption: "Community health camp",
    photographer: "Volunteer Squad",
    date: "2026-01-22",
  },
  {
    id: "PH-1201",
    eventCode: "RPRFEB02",
    caption: "Facilitator briefing",
    photographer: "Nikhil Das",
    date: "2026-02-27",
  },
];

export const statusLabels: Record<EventStatus, string> = {
  proposal: "Proposal",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

export const statusStyles: Record<EventStatus, string> = {
  proposal: "bg-amber-100 text-amber-900 border-amber-200",
  approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  in_progress: "bg-sky-100 text-sky-900 border-sky-200",
  completed: "bg-stone-200 text-stone-900 border-stone-300",
};

export function getEventByCode(code?: string | null) {
  if (!code) {
    return undefined;
  }

  return events.find((event) => event.code === code.toUpperCase());
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}
