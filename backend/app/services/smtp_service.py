import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp_code: str, purpose: str) -> bool:
    subject = f"Your Policybazaar Verification Code: {otp_code}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 5px solid #ff5a00;">
          <h2 style="color: #002970; margin-top: 0;">Policybazaar Security Desk</h2>
          <p style="font-size: 14px; color: #555;">Hello,</p>
          <p style="font-size: 14px; color: #555;">Your verification code for <strong>{purpose.replace('_', ' ')}</strong> is:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff5a00; background: #fff5f0; padding: 10px 24px; border-radius: 6px; border: 1px dashed #ff5a00;">{otp_code}</span>
          </div>
          <p style="font-size: 13px; color: #777;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #aaa; text-align: center;">Policybazaar Insurance Desk &bull; 100% Verified Security</p>
        </div>
      </body>
    </html>
    """
    
    return _dispatch_email(to_email, subject, html_content)

def send_renewal_reminder_email(to_email: str, customer_name: str, policy_number: str, policy_title: str, valid_until: str, premium_amount: float) -> bool:
    subject = f"Important: Policy Renewal Notice - {policy_number}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px;">
        <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 5px solid #00a896;">
          <h2 style="color: #002970; margin-top: 0;">Policy Guarantee & Renewal Reminder</h2>
          <p style="font-size: 14px; color: #555;">Dear <strong>{customer_name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your policy coverage <strong>{policy_title}</strong> (Policy #{policy_number}) is set to expire on <strong style="color: #d32f2f;">{valid_until}</strong>.</p>
          <div style="background: #f0fdf9; border-left: 4px solid #00a896; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #004d40;"><strong>Renewal Premium:</strong> ₹{premium_amount:,.2f}</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #00796b;">Maintain seamless protection for your family and assets.</p>
          </div>
          <p style="font-size: 13px; color: #555;">Please contact your assigned Insurance Agent or log into your client portal to renew standard benefits.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #aaa; text-align: center;">Policybazaar Client Services Desk</p>
        </div>
      </body>
    </html>
    """
    
    return _dispatch_email(to_email, subject, html_content)

def _dispatch_email(to_email: str, subject: str, html_content: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        # Live SMTP email dispatch with StartTLS
        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
            logger.info(f"Successfully sent live email via SMTP to {to_email}")
        except Exception as e:
            logger.warning(f"SMTP Dispatch fallback notice: {e}. Email subject: {subject}")
        return True
    except Exception as ex:
        logger.error(f"Failed to generate email message: {ex}")
        return False
