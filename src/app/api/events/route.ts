import { NextResponse } from "next/server";

export const revalidate = 300;

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbzC82aIEW2htieo5pgw-GYSKo9oixgUNuoisnUBv9TLc55JA-SkEJWtF8T6z4tvgB7R/exec";

const EPF_FORM_URL =
  process.env.NEXT_PUBLIC_EPF_FORM_URL ??
  "https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform";

const CITY_MAP: Record<string, string> = {
  MUM: "Mumbai",
  RPR: "Raipur",
  ASR: "Amritsar",
  PUN: "Pune",
  DEL: "Delhi",
};

const APPROVAL_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "Need Changes",
] as const;

type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

function toNumber(value?: string | number | boolean) {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const cleaned = value.replace(/[^0-9.]/g, "");
  return cleaned ? Number.parseFloat(cleaned) : 0;
}

function getMonthFromDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { month: "short" });
}

function getCityFromCode(code: string) {
  const key = code.slice(0, 3).toUpperCase();
  return CITY_MAP[key] ?? key;
}

function toApprovalStatus(value?: string): ApprovalStatus {
  if (!value) return "Pending";
  const normalized = value.trim();
  return (APPROVAL_STATUSES.find((status) => status === normalized) ??
    "Pending") as ApprovalStatus;
}

function normalizeRows(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.rows)) return record.rows;
  return [];
}

type DriveFilesPayload = {
  invoices?: Array<{ name: string; url: string; mimeType?: string; updated?: string }>;
  media?: Array<{ name: string; url: string; mimeType?: string; updated?: string }>;
  outreach?: Array<{ name: string; url: string; mimeType?: string; updated?: string }>;
};

type ApprovalOverride = {
  regional?: { status?: string; by?: string; at?: string; notes?: string };
  head?: { status?: string; by?: string; at?: string; notes?: string };
  accounts?: { status?: string; by?: string; at?: string; notes?: string };
  overall?: string;
};

function parseDriveFiles(value: unknown): DriveFilesPayload {
  if (!value) return { invoices: [], media: [], outreach: [] };
  let payload: unknown = value;
  if (typeof value === "string") {
    try {
      payload = JSON.parse(value);
    } catch {
      return { invoices: [], media: [], outreach: [] };
    }
  }
  if (!payload || typeof payload !== "object") {
    return { invoices: [], media: [], outreach: [] };
  }
  const record = payload as DriveFilesPayload;
  const normalize = (
    files?: Array<{ name: string; url: string; mimeType?: string; updated?: string }>
  ) =>
    Array.isArray(files)
      ? files.filter((file) => file && typeof file.url === "string")
      : [];
  return {
    invoices: normalize(record.invoices),
    media: normalize(record.media),
    outreach: normalize(record.outreach),
  };
}

function normalizeApprovalRow(row: Record<string, unknown>): {
  code: string;
  approvals: ApprovalOverride;
} | null {
  const lower = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toLowerCase().trim(), value])
  );
  const code =
    (lower["event code"] as string | undefined) ??
    (lower["eventcode"] as string | undefined) ??
    "";
  const trimmedCode = code.toString().trim().toUpperCase();
  if (!trimmedCode) return null;
  const approvals: ApprovalOverride = {
    regional: {
      status: (lower["regional status"] as string | undefined) ?? "",
      by: (lower["regional by"] as string | undefined) ?? "",
      at: (lower["regional at"] as string | undefined) ?? "",
      notes: (lower["regional notes"] as string | undefined) ?? "",
    },
    head: {
      status: (lower["head status"] as string | undefined) ?? "",
      by: (lower["head by"] as string | undefined) ?? "",
      at: (lower["head at"] as string | undefined) ?? "",
      notes: (lower["head notes"] as string | undefined) ?? "",
    },
    accounts: {
      status: (lower["accounts status"] as string | undefined) ?? "",
      by: (lower["accounts by"] as string | undefined) ?? "",
      at: (lower["accounts at"] as string | undefined) ?? "",
      notes: (lower["accounts notes"] as string | undefined) ?? "",
    },
    overall: (lower["overall status"] as string | undefined) ?? "",
  };
  return { code: trimmedCode, approvals };
}

function mapEpfRow(
  row: Record<string, string> & {
    driveFiles?: DriveFilesPayload;
    approvals?: ApprovalOverride;
  }
  ,
  approvalOverride?: ApprovalOverride
) {
  const code = (row["Enter Event code"] ?? "").trim().toUpperCase();
  const eventType = (row["Event Type"] ?? "Goal setting") as
    | "Goal setting"
    | "Earth embrace"
    | "Acts of Love"
    | "Funday Event";
  const proposalType = (row["Select One Option"] ??
    "New Event Proposal") as "Old Approved Event" | "New Event Proposal";
  const date = row["Date of Event"] ?? "";
  const city = getCityFromCode(code);
  const month = getMonthFromDate(date);
  const venue = row["Venue"] ?? "";
  const mode = /virtual|zoom|online/i.test(venue) ? "online" : "offline";
  const status =
    proposalType === "Old Approved Event" ? "approved" : "proposal";

  const driveFiles = parseDriveFiles((row as { driveFiles?: unknown }).driveFiles);
  const invoiceCount = Array.isArray(driveFiles.invoices)
    ? driveFiles.invoices.length
    : 0;
  const mediaCount = Array.isArray(driveFiles.media) ? driveFiles.media.length : 0;

  const approvals = approvalOverride ?? row.approvals ?? {};
  const regional = approvals.regional ?? {
    status: row["Regional status"],
    by: row["Regional by"],
    at: row["Regional at"],
    notes: row["Regional notes"],
  };
  const head = approvals.head ?? {
    status: row["Head status"],
    by: row["Head by"],
    at: row["Head at"],
    notes: row["Head notes"],
  };
  const accounts = approvals.accounts ?? {
    status: row["Accounts status"],
    by: row["Accounts by"],
    at: row["Accounts at"],
    notes: row["Accounts notes"],
  };
  const derivedOverall = (() => {
    const statuses = [
      toApprovalStatus(regional.status),
      toApprovalStatus(head.status),
      toApprovalStatus(accounts.status),
    ];
    if (statuses.includes("Rejected")) return "Rejected";
    if (statuses.includes("Need Changes")) return "Need Changes";
    if (statuses.every((status) => status === "Approved")) return "Approved";
    return "Pending";
  })();
  const overall =
    (approvals.overall as string) ??
    row["Overall status"] ??
    derivedOverall;

  return {
    code,
    title: eventType,
    city,
    month,
    date,
    startTime: row["Start time of event"] ?? "",
    duration: row["Duration of event"] ?? "",
    venue,
    objective: row["Objective of event"] ?? "",
    details: row["Event Details"] ?? "",
    eventType,
    proposalType,
    estimatedParticipants: toNumber(row["Estimated Participants"]),
    followUpDetails: row["Follow up session details"] ?? "",
    lead: row["Name"] ?? "",
    coordinatorName: row["Name"] ?? "",
    coordinatorPhone: row["Contact number of coordinator"] ?? "",
    coordinatorEmail: row["Email Id of Event coordinator"] ?? "",
    helperNames: row["Provide name of people helping coordinator f"] ?? "",
    budgetRequired: (row["Is there any cost involved in this event ?"] ??
      "No") as "Yes" | "No",
    budgetTotal: toNumber(row["Please provide total budget."]),
    budgetJustification: row["Please provide justification for budget"] ?? "",
    socialFlyerNeeded: (row["Do you need flyer on social media ?"] ??
      "No") as "Yes" | "No",
    socialFacebookEventNeeded: (row["Do you need separate event on Facebook ?"] ??
      "No") as "Yes" | "No",
    socialContentNotes: row["Anything particular you like to add in content"] ?? "",
    socialDesignNotes: row["Anything particular you like to see in designs"] ?? "",
    completionDate: "",
    startedOnTime: "Yes",
    delayReason: "",
    actualParticipants: 0,
    interestCount: 0,
    dataCaptured: "No",
    dataCaptureNotes: "",
    challenges: "",
    actualCost: 0,
    donationAmount: 0,
    donationDetails: "",
    eventWriteup: "",
    picturesSaved: "No",
    pictureNotes: "",
    socialTags: "",
    mode,
    status,
    budget: toNumber(row["Please provide total budget."]),
    spent: 0,
    invoices: invoiceCount,
    photos: mediaCount,
    epfLink: "EPF-Response",
    ecrLink: "ECR-Response",
    epfUrl: EPF_FORM_URL,
    ecrUrl: "",
    sheetLink: "EPF Master",
    driveFolder: row["Drive Folder URL"] ?? "",
    driveFiles,
    approvals: {
      regional: {
        status: toApprovalStatus(regional.status),
        by: regional.by ?? "",
        at: regional.at ?? "",
        notes: regional.notes ?? "",
      },
      head: {
        status: toApprovalStatus(head.status),
        by: head.by ?? "",
        at: head.at ?? "",
        notes: head.notes ?? "",
      },
      accounts: {
        status: toApprovalStatus(accounts.status),
        by: accounts.by ?? "",
        at: accounts.at ?? "",
        notes: accounts.notes ?? "",
      },
      overall: toApprovalStatus(overall),
    },
  };
}

export async function GET() {
  try {
    const [eventsResponse, approvalsResponse] = await Promise.all([
      fetch(APPS_SCRIPT_URL, {
        cache: "force-cache",
        next: { revalidate: 300 },
        redirect: "follow",
      }),
      fetch(`${APPS_SCRIPT_URL}?action=approvals`, {
        cache: "force-cache",
        next: { revalidate: 300 },
        redirect: "follow",
      }),
    ]);

    const eventsText = await eventsResponse.text();
    if (!eventsResponse.ok) {
      return NextResponse.json(
        {
          data: [],
          error: `Apps Script error: ${eventsResponse.status}`,
          detail: eventsText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    let eventsPayload: unknown;
    try {
      eventsPayload = JSON.parse(eventsText);
    } catch {
      return NextResponse.json(
        {
          data: [],
          error: "Apps Script did not return JSON.",
          detail: eventsText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    let approvalsMap = new Map<string, ApprovalOverride>();
    if (approvalsResponse.ok) {
      const approvalsText = await approvalsResponse.text();
      try {
        const approvalsPayload = JSON.parse(approvalsText);
        const approvalRows = normalizeRows(approvalsPayload);
        approvalRows.forEach((row) => {
          const normalized = normalizeApprovalRow(
            row as Record<string, unknown>
          );
          if (normalized) {
            approvalsMap.set(normalized.code, normalized.approvals);
          }
        });
      } catch {
        approvalsMap = new Map();
      }
    }

    const rows = normalizeRows(eventsPayload);
    const mapped = rows.map((row) => {
      const rawCode = (row as Record<string, string>)["Enter Event code"] ?? "";
      const code = rawCode.trim().toUpperCase();
      const approvalsOverride = approvalsMap.get(code);
      return mapEpfRow(row as Record<string, string>, approvalsOverride);
    });
    return NextResponse.json({ data: mapped, rawCount: rows.length });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        error: "Failed to load EPF data.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
