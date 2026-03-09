import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "noreply@fundlink.in";
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Load template helper
function loadTemplate(name: string): string {
  const templatePath = path.join(process.cwd(), "src/lib/email/templates", `${name}.html`);
  return fs.readFileSync(templatePath, "utf-8");
}

// Template replacement helper
function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

// ─── Welcome email ────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  const template = loadTemplate("welcome");
  const html = renderTemplate(template, {
    NAME: name,
    ROLE: role,
    APP: APP,
  });
  
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Welcome to FundLink, ${name}!`,
    html,
  });
}

// ─── Intro request (to founder) ───────────────────────────────────────────────
export async function sendIntroRequestEmail(opts: {
  founderEmail: string;
  founderName:  string;
  investorName: string;
  investorFirm: string;
  message:      string;
  introId:      string;
}) {
  const messageBlock = opts.message
    ? `<div style="background:#F8FAFC;border-radius:10px;padding:16px;margin-bottom:20px;border-left:3px solid #1FA3A3">
         <p style="color:#475569;font-size:14px;line-height:1.65;margin:0">"${opts.message}"</p>
       </div>`
    : "";
  
  const template = loadTemplate("intro-request");
  const html = renderTemplate(template, {
    INVESTOR_NAME: opts.investorName,
    INVESTOR_FIRM: opts.investorFirm ? ` (${opts.investorFirm})` : "",
    MESSAGE_BLOCK: messageBlock,
    INTRO_ID: opts.introId,
    APP: APP,
  });

  return resend.emails.send({
    from:    FROM,
    to:      opts.founderEmail,
    subject: `${opts.investorName} wants to connect with you on FundLink`,
    html,
  });
}

// ─── Intro accepted (to investor) ─────────────────────────────────────────────
export async function sendIntroAcceptedEmail(opts: {
  investorEmail: string;
  investorName:  string;
  founderName:   string;
  startupName:   string;
  founderEmail:  string;
}) {
  const template = loadTemplate("intro-accepted");
  const html = renderTemplate(template, {
    FOUNDER_NAME: opts.founderName,
    STARTUP_NAME: opts.startupName,
    FOUNDER_EMAIL: opts.founderEmail,
    APP: APP,
  });

  return resend.emails.send({
    from:    FROM,
    to:      opts.investorEmail,
    subject: `${opts.founderName} accepted your intro request on FundLink`,
    html,
  });
}

// ─── KYC status update ────────────────────────────────────────────────────────
export async function sendKycStatusEmail(opts: {
  to:     string;
  name:   string;
  status: "approved" | "rejected";
  note?:  string;
}) {
  const isApproved = opts.status === "approved";
  const noteBlock = opts.note ? `<br/><br/>Note from our team: ${opts.note}` : "";
  
  const template = loadTemplate("kyc-status");
  const html = renderTemplate(template, {
    STATUS_COLOR: isApproved ? "#10B981" : "#EF4444",
    STATUS_TITLE: isApproved ? "Approved" : "Rejected",
    STATUS: opts.status,
    NAME: opts.name,
    NOTE_BLOCK: noteBlock,
    DASHBOARD_PATH: isApproved ? "" : "kyc",
    BUTTON_TEXT: isApproved ? "Go to Dashboard →" : "Re-submit Documents →",
    APP: APP,
  });

  return resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Your FundLink KYC verification ${isApproved ? "was approved ✅" : "needs attention"}`,
    html,
  });
}

// ─── Support ticket reply ─────────────────────────────────────────────────────
export async function sendSupportReplyEmail(opts: {
  to:        string;
  name:      string;
  ticketId:  string;
  subject:   string;
  replyBody: string;
}) {
  const template = loadTemplate("support-reply");
  const html = renderTemplate(template, {
    TICKET_ID: opts.ticketId,
    SUBJECT: opts.subject,
    REPLY_BODY: opts.replyBody,
    APP: APP,
  });

  return resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Re: [${opts.ticketId}] ${opts.subject}`,
    html,
  });
}

// ─── Password reset ───────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const template = loadTemplate("password-reset");
  const html = renderTemplate(template, {
    RESET_URL: resetUrl,
  });

  return resend.emails.send({
    from:    FROM,
    to,
    subject: "Reset your FundLink password",
    html,
  });
}
