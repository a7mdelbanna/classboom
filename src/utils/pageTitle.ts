/**
 * Page Title Management
 * Utility for setting dynamic page titles throughout the application
 */

interface PageTitleConfig {
  title: string;
  description?: string;
}

const APP_NAME = 'ClassBoom';
const DEFAULT_DESCRIPTION = 'Modern School Management Platform';

/**
 * Set the document title and meta description
 */
export const setPageTitle = (config: string | PageTitleConfig): void => {
  const isString = typeof config === 'string';
  const title = isString ? config : config.title;
  const description = isString ? DEFAULT_DESCRIPTION : config.description;

  // Set document title
  document.title = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;

  // Update meta description if provided
  if (description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }
};

/**
 * Predefined page titles for common routes
 */
export const PAGE_TITLES = {
  // Public pages
  landing: `${APP_NAME} - Modern School Management Platform`,
  login: `Sign In | ${APP_NAME}`,
  signup: `Create Account | ${APP_NAME}`,
  
  // Dashboard
  dashboard: `Dashboard | ${APP_NAME}`,
  
  // Students
  students: `Students | ${APP_NAME}`,
  addStudent: `Add Student | ${APP_NAME}`,
  studentProfile: (name: string) => `${name} - Student Profile | ${APP_NAME}`,
  
  // Settings
  settings: `Settings | ${APP_NAME}`,
  
  // Portals
  studentPortal: `Student Portal | ${APP_NAME}`,
  parentPortal: `Parent Portal | ${APP_NAME}`,
  
  // Auth flows
  studentActivation: `Activate Student Account | ${APP_NAME}`,
  parentActivation: `Activate Parent Account | ${APP_NAME}`,
  
  // Setup
  setupWizard: `Setup Wizard | ${APP_NAME}`,
} as const;

/**
 * Hook for managing page titles in React components
 */
export const usePageTitle = (title: string | PageTitleConfig): void => {
  React.useEffect(() => {
    setPageTitle(title);
    
    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = PAGE_TITLES.landing;
    };
  }, [title]);
};

// Import React for the hook
import React from 'react';