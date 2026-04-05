/**
 * Route Guards and Permission Utilities
 * Centralized permission checking and route access logic
 */

/**
 * Check if user has admin access
 * @param {Object} user - User object (faculty)
 * @returns {boolean}
 */
export const hasAdminAccess = (user) => {
  if (!user) return false;

  const role = String(user?.role || '').toUpperCase();
  return Boolean(
    user?.isAdmin === true ||
    user?.is_admin === true ||
    user?.admin === true ||
    role === 'ADMIN' ||
    role === 'ROLE_ADMIN'
  );
};

/**
 * Faculty pages accessible to both faculty and admin
 */
const FACULTY_PAGES = new Set([
  'dashboard',
  'create-batch',
  'view-batches',
  'batch-details',
  'create-assignment',
  'assignment-list',
  'assignment-assessment',
  'marks-evaluation',
  'settings',
]);

/**
 * Admin-only pages
 */
const ADMIN_ONLY_PAGES = new Set([
  'pending-faculties',
  'all-faculties',
  'all-students',
  'create-student',
  'bulk-upload',
]);

/**
 * Student pages accessible only to students
 */
const STUDENT_PAGES = new Set([
  'overview',
  'batches',
  'batch-details',
  'assignments',
  'marks',
  'profile',
]);

/**
 * Check if user can access a specific page
 * @param {Object} user - User object
 * @param {string} pageName - Page name to check
 * @param {string} userType - 'faculty' or 'student'
 * @returns {boolean}
 */
export const canAccessPage = (user, pageName, userType = 'faculty') => {
  if (!user) return false;

  if (userType === 'student') {
    return STUDENT_PAGES.has(pageName);
  }

  // Faculty routes
  if (FACULTY_PAGES.has(pageName)) {
    return true;
  }

  // Admin-only routes
  if (ADMIN_ONLY_PAGES.has(pageName)) {
    return hasAdminAccess(user);
  }

  return false;
};

/**
 * Get list of pages available to user
 * @param {Object} user - User object
 * @param {string} userType - 'faculty' or 'student'
 * @returns {Array<string>} Array of accessible page names
 */
export const getAvailablePages = (user, userType = 'faculty') => {
  if (!user) return [];

  if (userType === 'student') {
    return Array.from(STUDENT_PAGES);
  }

  // Faculty pages
  const available = Array.from(FACULTY_PAGES);

  // Add admin pages if user is admin
  if (hasAdminAccess(user)) {
    available.push(...Array.from(ADMIN_ONLY_PAGES));
  }

  return available;
};

/**
 * Extract page name from pathname
 * @param {string} pathname - URL pathname
 * @returns {string|null} Page name or null if not found
 */
export const getPageFromPathname = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return null;

  // Remove leading/trailing slashes and get first segment
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return 'dashboard';
  if (segments[0] === 'student') {
    // Student routes
    if (segments.length === 1) return 'overview';
    if (segments[1] === 'batches') return segments[2] ? 'batch-details' : 'batches';
    if (segments[1] === 'assignments') return 'assignments';
    if (segments[1] === 'marks') return 'marks';
    if (segments[1] === 'profile') return 'profile';
    return 'overview';
  }

  // Faculty routes
  if (segments[0] === 'batches') {
    return segments[1] ? 'batch-details' : 'view-batches';
  }

  if (segments[0] === 'faculty') {
    if (segments[1] === 'assignments') {
      return segments[2] ? 'assignment-assessment' : 'assignment-list';
    }
  }

  // Map direct page access
  const pageMap = {
    'pending-faculties': 'pending-faculties',
    'all-faculties': 'all-faculties',
    'all-students': 'all-students',
    'create-batch': 'create-batch',
    'create-assignment': 'create-assignment',
    'marks-evaluation': 'marks-evaluation',
    'settings': 'settings',
  };

  return pageMap[segments[0]] || 'dashboard';
};

/**
 * Check if a route requires authentication
 * @param {string} pathname - URL pathname
 * @returns {boolean}
 */
export const requiresAuth = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return false;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/student/login', '/forgot-password', '/student/forgot-password'];

  return !publicRoutes.some(route => pathname.startsWith(route));
};

/**
 * Determine if path is a student route
 * @param {string} pathname - URL pathname
 * @returns {boolean}
 */
export const isStudentRoute = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return false;
  return pathname.startsWith('/student');
};

/**
 * Determine if path is a faculty route
 * @param {string} pathname - URL pathname
 * @returns {boolean}
 */
export const isFacultyRoute = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return true; // Default to faculty
  return !pathname.startsWith('/student');
};
