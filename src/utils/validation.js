/**
 * URL Parameter Validation Utilities
 * Validates and sanitizes URL parameters to prevent vulnerabilities
 */

// UUID pattern (handles both standard UUID and numeric IDs)
const UUID_PATTERN = /^[a-f0-9-]{36}$|^\d+$/i;

/**
 * Check if a value is a valid UUID or numeric ID
 * @param {string} value - Value to validate
 * @returns {boolean}
 */
export const isValidUUID = (value) => {
  if (!value || typeof value !== 'string') return false;
  return UUID_PATTERN.test(value.trim());
};

/**
 * Validate if a path segment is safe (alphanumeric, dash, underscore)
 * @param {string} path - Path segment to validate
 * @returns {boolean}
 */
export const isValidPath = (path) => {
  if (!path || typeof path !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(path.trim());
};

/**
 * Extract and validate URL parameters from pathname
 * @param {string} pathname - The URL pathname
 * @returns {Object} Extracted and validated parameters
 */
export const extractAndValidateParams = (pathname) => {
  const params = {};
  const errors = [];

  // Batch ID pattern: /batches/{id} or /batches/{id}/...
  const batchMatch = pathname.match(/\/batches\/([^/]+)/);
  if (batchMatch) {
    const batchId = batchMatch[1];
    if (!isValidUUID(batchId)) {
      errors.push(`Invalid batch ID: ${batchId}`);
    } else {
      params.batchId = decodeURIComponent(batchId);
    }
  }

  // Assignment ID pattern: /assignments/{id} or /faculty/assignments/{id}
  const assignmentMatch = pathname.match(/\/assignments\/([^/]+)/);
  if (assignmentMatch) {
    const assignmentId = assignmentMatch[1];
    if (!isValidUUID(assignmentId)) {
      errors.push(`Invalid assignment ID: ${assignmentId}`);
    } else {
      params.assignmentId = decodeURIComponent(assignmentId);
    }
  }

  // Student ID pattern: /student/{id}
  const studentMatch = pathname.match(/\/student\/([^/]+)/);
  if (studentMatch && !pathname.includes('student/login')) {
    const studentId = studentMatch[1];
    if (!isValidUUID(studentId)) {
      errors.push(`Invalid student ID: ${studentId}`);
    } else {
      params.studentId = decodeURIComponent(studentId);
    }
  }

  return {
    params,
    errors,
    isValid: errors.length === 0,
  };
};

/**
 * Prevent open redirect attacks by validating redirect URLs
 * Only allows relative paths starting with /
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const isValidRedirectUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  // Only allow relative URLs starting with /
  if (!url.startsWith('/')) return false;

  // Prevent protocol-based attacks (javascript:, data:, etc)
  try {
    const decodedUrl = decodeURIComponent(url);
    if (/^(javascript|data|vbscript):/i.test(decodedUrl)) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

/**
 * Sanitize a string to prevent XSS when displayed
 * @param {string} str - String to sanitize
 * @returns {string}
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';

  return str
    .replace(/[&<>"']/g, (match) => {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escapeMap[match];
    });
};

/**
 * Safely extract route-based parameters
 * @param {string} pathname - The URL pathname
 * @param {string} pattern - Regex pattern to extract
 * @returns {Object} Extracted parameter or null if invalid
 */
export const safeExtractParam = (pathname, pattern) => {
  if (!pathname || typeof pathname !== 'string') return null;

  try {
    const match = pathname.match(pattern);
    if (!match || !match[1]) return null;

    const value = decodeURIComponent(match[1]);
    if (!isValidUUID(value)) return null;

    return value;
  } catch {
    return null;
  }
};

/**
 * Validate user has required role
 * @param {Object} user - User object
 * @param {string|Array} requiredRoles - Single role or array of allowed roles
 * @returns {boolean}
 */
export const hasRequiredRole = (user, requiredRoles) => {
  if (!user) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userRole = String(user?.role || '').toUpperCase();
  const isAdmin = user?.isAdmin === true || user?.is_admin === true;

  // Admin always has access unless explicitly restricted
  if (isAdmin && !roles.includes('SPECIAL_RESTRICTED')) {
    return true;
  }

  return roles.some(role =>
    userRole === role.toUpperCase() ||
    userRole === `ROLE_${role.toUpperCase()}`
  );
};
