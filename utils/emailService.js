import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
    this.enabled = false;

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      this.enabled = true;
      this.fromEmail = process.env.EMAIL_USER;
      this.fromName = "Sara Advocates & Legal Consultants";

      this.logoURL =
        process.env.COMPANY_LOGO_URL ||
        "https://eyles-consulatancy-dubai-projects.vercel.app/EYLS-logo.png";
    } else {
      console.warn("⚠️  Email credentials not configured. Email disabled.");
    }
  }

  // Light, simple wrapper
  wrapHtml(innerContent = "") {
    return `
      <div style="margin:0; padding:24px 0; background:#f5f5f7; font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:8px; border:1px solid #e5e7eb; overflow:hidden;">
          
          <!-- Header -->
          <div style="padding:16px 20px; border-bottom:1px solid #e5e7eb; text-align:center;">
            <img 
              src="${this.logoURL}" 
              alt="Logo" 
              style="height:40px; width:auto;"
            />
          </div>

          <!-- Content -->
          <div style="padding:20px 20px 8px; color:#111827; font-size:14px; line-height:1.5;">
            ${innerContent}
          </div>

          <!-- Footer -->
          <div style="padding:12px 20px 14px; border-top:1px solid #e5e7eb; text-align:center; font-size:11px; color:#6b7280;">
            © ${new Date().getFullYear()} Sara Advocates & Legal Consultants. All rights reserved.
          </div>
        </div>
      </div>
    `;
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.enabled) {
      console.log(`📧 Email (disabled): To=${to}, Subject=${subject}`);
      return { success: false, message: "Email service not configured" };
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Email Error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Welcome email – light & simple, no “important” notes
  async sendWelcomeEmail(user, password) {
    const subject = "Welcome to Sara Advocates & Legal Consultants";

    const content = `
      <h2 style="margin:0 0 10px; font-size:18px; color:#111827;">
        Welcome to Sara Advocates & Legal Consultants
      </h2>
      <p style="margin:0 0 10px;">
        Your account has been created. Below are your login details:
      </p>

      <div style="margin:14px 0; padding:10px 12px; border-radius:6px; background:#f9fafb; border:1px solid #e5e7eb; font-size:13px;">
        <div><strong>Email:</strong> ${user.email}</div>
        <div><strong>Password:</strong> ${password}</div>
      </div>

      <p style="margin:10px 0;">
        You can now sign in and start using the platform.
      </p>

      <p style="margin:16px 0 4px;">
        Regards,<br/>
        Sara Advocates & Legal Consultants Team
      </p>
    `;

    const html = this.wrapHtml(content);
    return await this.sendEmail(user.email, subject, html);
  }

  // Case notification email – same light style
  async sendCaseNotification(to, caseNumber, message) {
    const subject = `Case ${caseNumber} Update`;

    const content = `
      <h2 style="margin:0 0 10px; font-size:18px; color:#111827;">
        Case Update – #${caseNumber}
      </h2>
      <p style="margin:0 0 10px;">
        There is a new update on your case:
      </p>

      <div style="margin:14px 0; padding:10px 12px; border-radius:6px; background:#f9fafb; border:1px solid #e5e7eb; font-size:13px;">
        ${message}
      </div>

      <p style="margin:10px 0;">
        For more details, please log in to your Sara Advocates & Legal Consultants account.
      </p>

      <p style="margin:16px 0 4px;">
        Regards,<br/>
        Sara Advocates & Legal Consultants Team
      </p>
    `;

    const html = this.wrapHtml(content);
    return await this.sendEmail(to, subject, html);
  }

  // Password reset email – light layout, minimal text
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = "Password reset link";

    const content = `
      <h2 style="margin:0 0 10px; font-size:18px; color:#111827;">
        Reset your password
      </h2>
      <p style="margin:0 0 10px;">
        Use the button below to set a new password for your account.
      </p>

      <a href="${resetUrl}"
         style="display:inline-block; margin:14px 0; padding:10px 20px; border-radius:4px; background:#2563eb; color:#ffffff; text-decoration:none; font-size:14px;">
        Reset password
      </a>

      <p style="margin:10px 0; font-size:12px; color:#6b7280;">
        If this email was not expected, you can ignore it.
      </p>

      <p style="margin:16px 0 4px;">
        Regards,<br/>
        Sara Advocates & Legal Consultants Team
      </p>
    `;

    const html = this.wrapHtml(content);
    return await this.sendEmail(user.email, subject, html);
  }

  // New Password email (for admin approved resets)
  async sendPasswordEmail(user, password) {
    const subject = "Your New Password";

    const content = `
      <h2 style="margin:0 0 10px; font-size:18px; color:#111827;">
        Password Reset Approved
      </h2>
      <p style="margin:0 0 10px;">
        Your password reset request has been approved. Here is your new password:
      </p>

      <div style="margin:14px 0; padding:10px 12px; border-radius:6px; background:#f9fafb; border:1px solid #e5e7eb; font-size:13px;">
        <div><strong>Email:</strong> ${user.email}</div>
        <div><strong>New Password:</strong> ${password}</div>
      </div>

      <p style="margin:10px 0;">
        Please log in and change this password immediately.
      </p>

      <p style="margin:16px 0 4px;">
        Regards,<br/>
        Sara Advocates & Legal Consultants Team
      </p>
    `;

    const html = this.wrapHtml(content);
    return await this.sendEmail(user.email, subject, html);
  }
}

export default new EmailService();
