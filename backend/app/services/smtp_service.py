import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger("uvicorn")

def generate_otp_email_html(recipient_email: str, otp_code: str, purpose_title: str, purpose_desc: str) -> str:
    """Generates a rich HTML email template matching the website's design aesthetic."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{purpose_title} - InsurCare PRO</title>
      <style>
        body {{
          font-family: 'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #0f172a;
        }}
        .container {{
          max-width: 580px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
        }}
        .header {{
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
          padding: 32px 24px;
          text-align: center;
        }}
        .logo-text {{
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0;
        }}
        .logo-badge {{
          background-color: #2563eb;
          color: #ffffff;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          margin-left: 6px;
          vertical-align: middle;
        }}
        .content {{
          padding: 36px 32px;
        }}
        .title {{
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 8px;
        }}
        .description {{
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 28px;
        }}
        .otp-card {{
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          margin-bottom: 28px;
        }}
        .otp-label {{
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }}
        .otp-code {{
          font-size: 36px;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: 8px;
          font-family: monospace;
          margin: 0;
        }}
        .warning-box {{
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 13px;
          color: #92400e;
          line-height: 1.5;
          margin-bottom: 28px;
        }}
        .footer {{
          background-color: #f8fafc;
          padding: 20px 32px;
          text-align: center;
          border-top: 1px solid #f1f5f9;
          font-size: 12px;
          color: #94a3b8;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-text">InsurCare <span class="logo-badge">PRO</span></h1>
        </div>
        <div class="content">
          <h2 class="title">{purpose_title}</h2>
          <p class="description">{purpose_desc}</p>

          <div class="otp-card">
            <div class="otp-label">Your 6-Digit Verification Code</div>
            <div class="otp-code">{otp_code}</div>
          </div>

          <div class="warning-box">
            ⏰ <strong>Important:</strong> This verification code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone for security reasons.
          </div>

          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            If you did not request this verification code, please ignore this email or contact support.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 InsurCare Policy & Claims Management System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

def send_smtp_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """Sends an email via SMTP. Logs to console fallback if SMTP credentials are missing/unreachable."""
    # Log to console for quick developer verification
    logger.info(f"[SMTP SERVICE] Preparing email to {to_email} | Subject: '{subject}'")

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"[SMTP MOCK LOG] SMTP credentials not set in config. Email simulated successfully for {to_email}.")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAILS_FROM
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        clean_password = settings.SMTP_PASSWORD.replace(" ", "")
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, clean_password)
            server.sendmail(settings.EMAILS_FROM, [to_email], msg.as_string())
        
        logger.info(f"[SMTP SERVICE] Email successfully delivered to {to_email} via SMTP.")
        return True
    except Exception as e:
        logger.error(f"[SMTP ERROR] Failed to send email to {to_email}: {e}")
        return False

def send_otp_email(to_email: str, otp_code: str, purpose: str = "REGISTRATION") -> bool:
    """Sends a 6-digit OTP verification email."""
    if purpose == "FORGOT_PASSWORD":
        title = "Password Reset Request"
        desc = f"We received a request to reset the password for your InsurCare account (<strong>{to_email}</strong>). Use the verification code below to set a new password."
        subject = f"[{otp_code}] InsurCare PRO - Password Reset Verification Code"
    else:
        title = "Email Verification Code"
        desc = f"Thank you for signing up for InsurCare PRO (<strong>{to_email}</strong>). Please enter the verification code below to complete your registration."
        subject = f"[{otp_code}] InsurCare PRO - Signup Verification Code"

    html = generate_otp_email_html(to_email, otp_code, title, desc)
    plain = f"{title}\n\nYour 6-digit verification code is: {otp_code}\n\nThis code expires in 10 minutes."
    return send_smtp_email(to_email, subject, html, plain)
