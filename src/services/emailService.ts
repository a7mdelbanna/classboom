import { supabase } from '../lib/supabase';

// Email template types
export type EmailTemplateType = 
  | 'student_invitation'
  | 'parent_invitation'
  | 'staff_invitation'
  | 'student_welcome'
  | 'parent_welcome'
  | 'staff_welcome'
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

interface StaffInvitationData {
  staffName: string;
  staffRole: string;
  schoolName: string;
  inviterName: string;
  activationLink: string;
  department?: string;
  startDate?: string;
}

export class EmailService {
  private static async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Log email for debugging
      console.log('📧 Sending email via Edge Function:', {
        to: data.to,
        subject: data.subject
      });

      // Call the Edge Function to send email
      const { data: response, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text
        }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw error;
      }

      // Check if the response indicates success
      if (!response || !response.success) {
        const errorMessage = response?.error || 'Unknown error occurred';
        console.error('❌ Email service returned error:', errorMessage);
        
        // Show more detailed error information
        if (response?.details) {
          console.error('📋 Error details:', response.details);
        }
        
        throw new Error(errorMessage);
      }

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

  static async sendStaffInvitation(
    email: string,
    data: StaffInvitationData
  ): Promise<boolean> {
    const subject = `${data.schoolName} - Join Our Staff Portal`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background: #f5f5f5; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 10px; 
              overflow: hidden; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold; 
            }
            .content { 
              padding: 40px 30px; 
              background: #fafafa; 
            }
            .button { 
              display: inline-block; 
              padding: 15px 35px; 
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
              color: white; 
              text-decoration: none; 
              border-radius: 30px; 
              font-weight: bold; 
              margin: 25px 0; 
              box-shadow: 0 5px 15px rgba(249, 115, 22, 0.3); 
              transition: transform 0.2s; 
            }
            .button:hover { 
              transform: translateY(-2px); 
            }
            .info-card { 
              background: white; 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0; 
              border-left: 4px solid #f97316; 
            }
            .features { 
              background: white; 
              padding: 25px; 
              border-radius: 10px; 
              margin: 25px 0; 
            }
            .features ul { 
              list-style: none; 
              padding: 0; 
            }
            .features li { 
              padding: 8px 0; 
              position: relative; 
              padding-left: 25px; 
            }
            .features li:before { 
              content: "✓"; 
              position: absolute; 
              left: 0; 
              color: #f97316; 
              font-weight: bold; 
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              background: #333; 
              color: #ccc; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to the Team!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited to join ${data.schoolName}</p>
            </div>
            <div class="content">
              <p><strong>Dear ${data.staffName},</strong></p>
              
              <p>${data.inviterName} has invited you to join ${data.schoolName} as a <strong>${data.staffRole}</strong>${data.department ? ` in the ${data.department} department` : ''}.</p>
              
              ${data.startDate ? `
                <div class="info-card">
                  <p><strong>Start Date:</strong> ${data.startDate}</p>
                </div>
              ` : ''}
              
              <div class="features">
                <h3 style="color: #f97316; margin-top: 0;">Staff Portal Features:</h3>
                <ul>
                  <li>View your personal profile and employment details</li>
                  <li>Access your class schedules and assignments</li>
                  <li>Track your compensation and payroll information</li>
                  <li>Communicate with students and other staff</li>
                  <li>Update your availability and contact information</li>
                  <li>Access educational resources and materials</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.activationLink}" class="button">Activate Your Account</a>
              </p>
              
              <p><strong>Getting Started:</strong></p>
              <ol>
                <li>Click the activation button above</li>
                <li>Create your secure password</li>
                <li>Complete your profile setup</li>
                <li>Start using your staff portal!</li>
              </ol>
              
              <p>If you have any questions about your role or need technical assistance, please contact the school administration.</p>
              
              <p>We're excited to have you on our team!</p>
              
              <p>Best regards,<br>
              <strong>${data.inviterName}</strong><br>
              ${data.schoolName}</p>
            </div>
            <div class="footer">
              <p>This invitation is secure and personalized for you.</p>
              <p>&copy; 2025 ClassBoom. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Staff Portal Invitation

Dear ${data.staffName},

${data.inviterName} has invited you to join ${data.schoolName} as a ${data.staffRole}${data.department ? ` in the ${data.department} department` : ''}.

${data.startDate ? `Start Date: ${data.startDate}` : ''}

Activate your staff account here: ${data.activationLink}

Staff Portal Features:
• View your personal profile and employment details
• Access your class schedules and assignments
• Track your compensation and payroll information
• Communicate with students and other staff
• Update your availability and contact information
• Access educational resources and materials

Getting Started:
1. Click the activation link above
2. Create your secure password
3. Complete your profile setup
4. Start using your staff portal!

Best regards,
${data.inviterName}
${data.schoolName}
    `.trim();

    return this.sendEmail({ to: email, subject, html, text });
  }

  static async sendWelcomeEmail(
    email: string,
    name: string,
    schoolName: string,
    portalType: 'student' | 'parent' | 'staff'
  ): Promise<boolean> {
    const getPortalTitle = (type: string) => {
      switch (type) {
        case 'student': return 'Student';
        case 'parent': return 'Parent';
        case 'staff': return 'Staff';
        default: return 'Portal';
      }
    };
    
    const subject = `Welcome to ${schoolName} ${getPortalTitle(portalType)} Portal`;
    
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
              
              <p>Your ${getPortalTitle(portalType).toLowerCase()} account has been successfully activated!</p>
              
              <p>You can now log in to your portal to access all available features.</p>
              
              <p style="text-align: center;">
                <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/login" class="button">Go to Portal</a>
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
      text: `Welcome to ${schoolName}! Your ${getPortalTitle(portalType).toLowerCase()} account has been activated. Log in at: ${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/login`
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