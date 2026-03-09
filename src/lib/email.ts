import { Resend } from "resend";

// Initialize Resend client only if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendIntroRequestEmail({
  to,
  founderName,
  investorName,
  firmName,
  message,
}: {
  to: string;
  founderName: string;
  investorName: string;
  firmName?: string;
  message?: string;
}) {
  if (!resend) {
    console.warn("[Email] Resend API key not configured. Email not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: "FundLink <noreply@fundlink.app>",
      to,
      subject: `New introduction request from ${investorName}`,
      html: `
        <h2>You have a new introduction request</h2>
        <p>${investorName}${firmName ? ` from ${firmName}` : ""} would like to connect with you.</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        <p><a href="https://fundlink.app/dashboard/founder?tab=intros">View intro request</a></p>
      `,
    });
  } catch (error) {
    console.error("[Email] Failed to send intro request email:", error);
  }
}

export async function sendIntroAcceptedEmail({
  to,
  investorName,
  founderName,
  founderEmail,
}: {
  to: string;
  investorName: string;
  founderName: string;
  founderEmail: string;
}) {
  if (!resend) {
    console.warn("[Email] Resend API key not configured. Email not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: "FundLink <noreply@fundlink.app>",
      to,
      subject: `${founderName} accepted your intro request!`,
      html: `
        <h2>Great news!</h2>
        <p>${founderName} has accepted your introduction request.</p>
        <p><strong>Email:</strong> ${founderEmail}</p>
        <p><a href="https://fundlink.app/dashboard/investor/intros">View your intros</a></p>
      `,
    });
  } catch (error) {
    console.error("[Email] Failed to send intro accepted email:", error);
  }
}

export async function sendSupportReplyEmail({
  to,
  name,
  ticketId,
  subject,
  replyBody,
}: {
  to: string;
  name: string;
  ticketId: string;
  subject: string;
  replyBody: string;
}) {
  if (!resend) {
    console.warn("[Email] Resend API key not configured. Email not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: "FundLink Support <support@fundlink.app>",
      to,
      subject: `Re: ${subject} (Ticket #${ticketId})`,
      html: `
        <h2>Support Team Response</h2>
        <p>Hi ${name},</p>
        <p>${replyBody}</p>
        <p><a href="https://fundlink.app/support?ticket=${ticketId}">View ticket</a></p>
      `,
    });
  } catch (error) {
    console.error("[Email] Failed to send support reply email:", error);
  }
}
