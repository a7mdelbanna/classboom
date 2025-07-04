/**
 * Email Configuration
 * 
 * Centralized email settings that can be easily changed for different environments.
 * Simply update the environment variables to switch domains/providers.
 */

export const emailConfig = {
  // Sender Information
  fromAddress: import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'noreply@classboom.vercel.app',
  fromName: import.meta.env.VITE_EMAIL_FROM_NAME || 'ClassBoom',
  supportAddress: import.meta.env.VITE_EMAIL_SUPPORT_ADDRESS || 'support@classboom.vercel.app',
  
  // App URLs
  appUrl: import.meta.env.VITE_APP_URL || 'https://classboom.vercel.app',
  
  // Email Templates
  templates: {
    studentInvite: {
      subject: 'Welcome to {{school_name}} - Activate Your Student Account',
      preheader: 'Complete your account setup to access your student portal'
    },
    parentInvite: {
      subject: 'Parent Portal Access for {{student_name}} at {{school_name}}',
      preheader: 'Monitor your child\'s progress and stay connected with their education'
    },
    schoolWelcome: {
      subject: 'Welcome to ClassBoom - Verify Your Account',
      preheader: 'Complete your school setup and start managing your institution'
    }
  },
  
  // SMTP Settings (for reference - configured in Supabase)
  smtp: {
    host: 'smtp.resend.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: 'resend',
      pass: import.meta.env.VITE_RESEND_API_KEY
    }
  }
};

/**
 * Helper function to generate activation URLs
 */
export const generateActivationUrl = (type: 'student' | 'parent', token: string): string => {
  return `${emailConfig.appUrl}/activate/${type}/${token}`;
};

/**
 * Helper function to replace template variables
 */
export const replaceTemplateVars = (template: string, variables: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
};

export default emailConfig;