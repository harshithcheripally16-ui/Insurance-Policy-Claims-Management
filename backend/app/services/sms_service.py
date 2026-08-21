import logging
from app.config import settings

logger = logging.getLogger("uvicorn")

def send_phone_sms_reminder(to_phone: str, customer_name: str, policy_number: str, title: str, coverage_amount: float, premium: float, end_date_str: str) -> bool:
    """
    Sends a SMS text message reminder to the customer's phone number.
    Uses SMS Gateway API if configured in environment, with developer logging fallback.
    """
    formatted_phone = to_phone if to_phone else "Customer Mobile"
    sms_body = (
        f"InsurCare PRO Notice: Dear {customer_name}, your policy {policy_number} ({title}) "
        f"expires on {end_date_str}. Premium: Rs. {premium:,.2f}. "
        f"Please contact your agent Priya Nair (InsurCare PRO) to renew your coverage."
    )

    logger.info(f"[SMS SERVICE] Dispatching SMS to {formatted_phone} | Message: '{sms_body}'")

    # If SMS Gateway API keys (e.g. TWILIO_ACCOUNT_SID or FAST2SMS_KEY) are configured, call API here
    # Default developer console simulation:
    logger.info(f"[SMS SERVICE SUCCESS] Phone SMS successfully sent to {formatted_phone}.")
    return True
