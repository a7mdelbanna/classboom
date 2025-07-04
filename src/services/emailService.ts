import { supabase } from '../lib/supabase';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Email template types
export type EmailTemplateType = 
  | 'student_invitation'
  | 'parent_invitation'
  | 'student_welcome'
  | 'parent_welcome'
  | 'password_reset'
  | 'account_activated';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface StudentInvitationData {
  studentName: string;
  schoolName: string;
  inviterName: string;
  activationLink: string;
  expiresIn: string;
}

interface ParentInvitationData {
  parentName: string;
  studentName: string;
  schoolName: string;
  inviterName: string;
  activationLink: string;
  studentCode?: string;
}

export class EmailService {
  private static async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Log email for debugging
      console.log('📧 Sending email via Resend:', {
        to: data.to,
        subject: data.subject
      });

      // Send email using Resend
      const response = await resend.emails.send({
        from: 'ClassBoom <onboarding@resend.dev>', // You'll need to verify your domain later
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text
      });

      console.log('✅ Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Still log the email content for debugging
      console.log('📧 Email content that failed to send:', {
        to: data.to,
        subject: data.subject,
        preview: data.text?.substring(0, 100) + '...'
      });
      
      return false;
    }
  }

  static async sendStudentInvitation(
    email: string, 
    data: StudentInvitationData
  ): Promise<boolean> {
    const subject = `${data.schoolName} - Activate Your Student Portal`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${data.schoolName}!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.studentName},</p>
              
              <p>${data.inviterName} has invited you to access your student portal at ${data.schoolName}.</p>
              
              <p>With your student portal, you can:</p>
              <ul>
                <li>View your class schedule</li>
                <li>Check your attendance</li>
                <li>Access course materials</li>
                <li>View grades and progress</li>
                <li>Receive important announcements</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${data.activationLink}" class="button">Activate Your Account</a>
              </p>
              
              <p><strong>Important:</strong> This invitation link will expire in ${data.expiresIn}.</p>
              
              <p>If you have any questions, please contact your school administrator.</p>
              
              <p>Best regards,<br>${data.schoolName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; 2025 ClassBoom. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to ${data.schoolName}!

Hi ${data.studentName},

${data.inviterName} has invited you to access your student portal at ${data.schoolName}.

Activate your account here: ${data.activationLink}

This invitation link will expire in ${data.expiresIn}.

Best regards,
${data.schoolName} Team
    `.trim();

    return this.sendEmail({ to: email, subject, html, text });
  }

  static async sendParentInvitation(
    email: string,
    data: ParentInvitationData
  ): Promise<boolean> {
    const subject = `${data.schoolName} - Parent Portal Access`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .code-box { background: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Parent Portal Access</h1>
            </div>
            <div class="content">
              <p>Dear ${data.parentName || 'Parent/Guardian'},</p>
              
              <p>${data.inviterName} from ${data.schoolName} has invited you to access the parent portal for ${data.studentName}.</p>
              
              <p>With the parent portal, you can:</p>
              <ul>
                <li>Monitor your child's attendance</li>
                <li>View grades and academic progress</li>
                <li>Communicate with teachers</li>
                <li>Access school announcements</li>
                <li>Manage payment information</li>
              </ul>
              
              ${data.studentCode ? `
                <p>Your child's student code is:</p>
                <div class="code-box">${data.studentCode}</div>
                <p>You'll need this code during signup to link your account to your child.</p>
              ` : ''}
              
              <p style="text-align: center;">
                <a href="${data.activationLink}" class="button">Create Parent Account</a>
              </p>
              
              <p>If you have any questions, please contact the school administration.</p>
              
              <p>Best regards,<br>${data.schoolName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; 2025 ClassBoom. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Parent Portal Access

Dear ${data.parentName || 'Parent/Guardian'},

${data.inviterName} from ${data.schoolName} has invited you to access the parent portal for ${data.studentName}.

${data.studentCode ? `Your child's student code is: ${data.studentCode}` : ''}

Create your parent account here: ${data.activationLink}

Best regards,
${data.schoolName} Team
    `.trim();

    return this.sendEmail({ to: email, subject, html, text });
  }

  static async sendWelcomeEmail(
    email: string,
    name: string,
    schoolName: string,
    portalType: 'student' | 'parent'
  ): Promise<boolean> {
    const subject = `Welcome to ${schoolName} ${portalType === 'student' ? 'Student' : 'Parent'} Portal`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ClassBoom!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              
              <p>Your ${portalType} account has been successfully activated!</p>
              
              <p>You can now log in to your portal to access all available features.</p>
              
              <p style="text-align: center;">
                <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/login" class="button">Go to Portal</a>
              </p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>${schoolName} Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ClassBoom. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ 
      to: email, 
      subject, 
      html,
      text: `Welcome to ${schoolName}! Your ${portalType} account has been activated. Log in at: ${process.env.VITE_APP_URL || 'http://localhost:5173'}/login`
    });
  }

  // Helper to generate secure invitation tokens
  static generateInvitationToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Helper to calculate token expiration
  static getTokenExpiration(hours: number = 48): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    return expiration;
  }
}