import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email notifications will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Instagram-styled email template with inline styles
function createEmailTemplate(messageTitle: string, price: string, unlockUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(to bottom, #000000, #1a1a1a); color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; margin-bottom: 20px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%); margin: 0 auto 8px;"></div>
        <div style="font-size: 28px; font-weight: 700; color: #FD1D1D;">Secret Message</div>
      </div>
    </div>
    
    <div style="background: #1C1C1C; border: 1px solid #303030; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <div style="text-align: center;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #303030; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #FD1D1D;">
          <svg width="32" height="40" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="14" width="16" height="12" rx="2" stroke="#FD1D1D" stroke-width="2" fill="none"/>
            <path d="M8 14V10C8 6.68629 10.6863 4 14 4H14C15.3261 4 16 4.67392 16 6V14" stroke="#FD1D1D" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="20" r="1.5" fill="#FD1D1D"/>
          </svg>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #ffffff;">You have a new paywalled message!</h1>
      </div>
      
      <p style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 8px 0;">"${messageTitle}"</p>
      
      <p style="color: #a8a8a8; line-height: 1.6; margin: 16px 0;">
        Someone sent you a special encrypted message on Secret Message. Pay to unlock and see what's inside!
      </p>
      
      <div style="text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #FD1D1D; margin: 16px 0;">$${price}</div>
        <p style="color: #a8a8a8; line-height: 1.6; margin: 0 0 16px 0;">to unlock this message</p>
        
        <a href="${unlockUrl}" style="display: inline-block; background: linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 9999px; font-weight: 600; font-size: 16px; margin: 16px 0; box-shadow: 0 8px 24px rgba(131, 58, 180, 0.3);">
          Pay to Unlock
        </a>
      </div>
      
      <p style="color: #a8a8a8; line-height: 1.6; margin: 24px 0 0 0; font-size: 12px;">
        This message is protected and can only be viewed after payment. Click the button above to unlock it securely with Stripe.
      </p>
    </div>
    
    <div style="text-align: center; color: #6b6b6b; font-size: 14px; margin-top: 40px; padding-top: 24px; border-top: 1px solid #303030;">
      <p style="margin: 0 0 8px 0;">Sent via Secret Message – secure pay-to-open messaging</p>
      <p style="margin: 0;">
        This email was sent because someone created a paywalled message for you.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

interface SendMessageNotificationParams {
  recipientEmail: string;
  messageTitle: string;
  price: string;
  slug: string;
  senderName?: string;
}

export async function sendMessageNotification({
  recipientEmail,
  messageTitle,
  price,
  slug,
  senderName,
}: SendMessageNotificationParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend is not configured. Skipping email notification.');
    return { success: false, error: 'Email service not configured' };
  }

  if (!isValidEmail(recipientEmail)) {
    console.log(`Skipping email - invalid email address: ${recipientEmail}`);
    return { success: false, error: 'Invalid email address' };
  }

  try {
    let baseUrl = '';
    
    if (process.env.REPLIT_APP_URL) {
      try {
        const url = new URL(process.env.REPLIT_APP_URL);
        baseUrl = url.origin;
      } catch {
        baseUrl = process.env.REPLIT_APP_URL.replace(/\/$/, '');
      }
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else if (process.env.REPLIT_DOMAINS) {
      const domain = process.env.REPLIT_DOMAINS.split(',')[0]?.trim();
      baseUrl = domain ? `https://${domain}` : '';
    } else if (!process.env.REPL_ID) {
      baseUrl = 'http://localhost:5000';
    }
    
    if (!baseUrl) {
      console.error('No domain configured for email links - check REPLIT_APP_URL, REPLIT_DEV_DOMAIN, or REPLIT_DOMAINS environment variables');
      return { success: false, error: 'Email service misconfigured - no domain available' };
    }
    
    const unlockUrl = `${baseUrl}/m/${slug}`;
    console.log(`Email unlock URL: ${unlockUrl}`);
    
    const subject = senderName 
      ? `${senderName} sent you a message on Secret Message`
      : 'You have a new message on Secret Message';

    const emailPayload = {
      from: 'onboarding@resend.dev',
      to: recipientEmail,
      subject,
      html: createEmailTemplate(messageTitle, price, unlockUrl),
    };

    console.log('Attempting to send email with payload:', JSON.stringify({ from: emailPayload.from, to: emailPayload.to, subject: emailPayload.subject }));

    const { data, error} = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
