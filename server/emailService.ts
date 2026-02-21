import { Resend } from 'resend';
import { getBaseUrl } from './url';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email notifications will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Clean white email template with box logo
function createEmailTemplate(messageTitle: string, price: string, unlockUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block;">
        <!-- Box Logo -->
        <div style="width: 48px; height: 48px; background: #18181b; border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; background: #fafafa; border-radius: 2px;"></div>
        </div>
        <div style="font-size: 24px; font-weight: 600; color: #18181b; letter-spacing: -0.5px;">Secret Message</div>
      </div>
    </div>
    
    <!-- Main Card -->
    <div style="background: #ffffff; border: 1px solid #e4e4e7; padding: 32px; margin-bottom: 24px;">
      <div style="text-align: center;">
        <!-- Lock Icon -->
        <div style="width: 56px; height: 56px; background: #18181b; border-radius: 8px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#fafafa" stroke-width="2" fill="none"/>
            <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#fafafa" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#fafafa"/>
          </svg>
        </div>
        <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px 0; color: #18181b;">You have a new paywalled message!</h1>
      </div>
      
      <div style="background: #f4f4f5; border: 1px solid #e4e4e7; padding: 16px; margin: 24px 0;">
        <p style="font-size: 18px; font-weight: 500; color: #18181b; margin: 0;">"${messageTitle}"</p>
      </div>
      
      <p style="color: #71717a; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        Someone sent you a secret message. Pay to unlock and see what's inside.
      </p>
      
      <div style="text-align: center;">
        <div style="font-size: 36px; font-weight: 700; color: #18181b; margin: 0 0 4px 0;">$${price}</div>
        <p style="color: #71717a; margin: 0 0 24px 0; font-size: 14px;">to unlock this message</p>
        
        <a href="${unlockUrl}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 16px;">
          Pay to Unlock →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; color: #a1a1aa; font-size: 13px;">
      <p style="margin: 0 0 8px 0;">Sent via Secret Message</p>
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

// Partner inquiry email template
function createPartnerInquiryTemplate(data: {
  name: string;
  email: string;
  website?: string;
  message?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; padding: 32px;">
    <h1 style="margin: 0 0 24px 0; font-size: 24px; color: #18181b;">New Partner Application</h1>
    
    <div style="margin-bottom: 16px;">
      <strong style="color: #71717a;">Name:</strong>
      <p style="margin: 4px 0 0 0; color: #18181b;">${data.name}</p>
    </div>
    
    <div style="margin-bottom: 16px;">
      <strong style="color: #71717a;">Email:</strong>
      <p style="margin: 4px 0 0 0; color: #18181b;">${data.email}</p>
    </div>
    
    ${data.website ? `
    <div style="margin-bottom: 16px;">
      <strong style="color: #71717a;">Website:</strong>
      <p style="margin: 4px 0 0 0; color: #18181b;"><a href="${data.website}">${data.website}</a></p>
    </div>
    ` : ''}
    
    ${data.message ? `
    <div style="margin-bottom: 16px;">
      <strong style="color: #71717a;">Message:</strong>
      <p style="margin: 4px 0 0 0; color: #18181b; white-space: pre-wrap;">${data.message}</p>
    </div>
    ` : ''}
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
    
    <p style="color: #71717a; font-size: 14px; margin: 0;">
      Reply directly to this email to contact the applicant.
    </p>
  </div>
</body>
</html>
  `;
}

interface SendPartnerInquiryParams {
  name: string;
  email: string;
  website?: string;
  message?: string;
}

export async function sendPartnerInquiry(data: SendPartnerInquiryParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend is not configured. Skipping partner inquiry email.');
    return { success: false, error: 'Email service not configured' };
  }

  if (!isValidEmail(data.email)) {
    return { success: false, error: 'Invalid email address' };
  }

  try {
    const { error } = await resend.emails.send({
      from: 'message4u@secretmessage4u.com',
      to: 'message4u@secretmessage4u.com',
      replyTo: data.email,
      subject: `Partner Application: ${data.name}`,
      html: createPartnerInquiryTemplate(data),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending partner inquiry:', error);
    return { success: false, error: error.message };
  }
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
    const baseUrl = getBaseUrl();
    const unlockUrl = `${baseUrl}/m/${slug}`;
    console.log(`Email unlock URL: ${unlockUrl}`);
    
    const subject = senderName 
      ? `${senderName} sent you a message on Secret Message`
      : 'You have a new message on Secret Message';

    const emailPayload = {
      from: 'message4u@secretmessage4u.com',
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

