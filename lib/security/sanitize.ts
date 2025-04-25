/**
 * HTML Sanitization utilities
 *
 * This module provides functions to sanitize user-generated content
 * to prevent XSS attacks and other security issues.
 */

// Define allowed HTML tags and attributes
const ALLOWED_TAGS = [
  'p',
  'br',
  'b',
  'i',
  'em',
  'strong',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
];

const ALLOWED_ATTRS = {
  a: ['href', 'title', 'target', 'rel'],
  // Add other tag-specific attributes as needed
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 *
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  try {
    // Create a temporary DOM element
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // Walk through all nodes and remove disallowed tags and attributes
    const walk = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        // Remove disallowed tags
        if (!ALLOWED_TAGS.includes(tagName)) {
          element.parentNode?.replaceChild(
            document.createTextNode(element.textContent || ''),
            element
          );
          return;
        }

        // Remove disallowed attributes
        const allowedAttrs = ALLOWED_ATTRS[tagName as keyof typeof ALLOWED_ATTRS] || [];
        for (let i = element.attributes.length - 1; i >= 0; i--) {
          const attr = element.attributes[i];
          if (!allowedAttrs.includes(attr.name)) {
            element.removeAttribute(attr.name);
          }

          // Special handling for href attributes to prevent javascript: URLs
          if (attr.name === 'href') {
            const value = attr.value.toLowerCase().trim();
            if (value.startsWith('javascript:') || value.startsWith('data:')) {
              element.removeAttribute(attr.name);
            }
          }

          // Remove event handlers
          if (attr.name.startsWith('on')) {
            element.removeAttribute(attr.name);
          }
        }

        // Add rel="noopener noreferrer" to all external links
        if (tagName === 'a' && element.hasAttribute('href')) {
          const href = element.getAttribute('href') || '';
          if (href.startsWith('http')) {
            element.setAttribute('rel', 'noopener noreferrer');
            element.setAttribute('target', '_blank');
          }
        }
      }

      // Process child nodes
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach(walk);
    };

    walk(tempElement);

    return tempElement.innerHTML;
  } catch (error) {
    // Fallback to basic sanitization if DOM manipulation fails
    // (e.g., in server-side environments)
    return basicSanitizeHtml(html);
  }
}

/**
 * Basic HTML sanitization for server-side environments
 *
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML string
 */
function basicSanitizeHtml(html: string): string {
  if (!html) return '';

  // Replace potentially dangerous HTML tags and attributes
  return (
    html
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove onclick and similar event handlers
      .replace(/on\w+="[^"]*"/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:[^"']+/gi, '')
      // Remove data: URLs
      .replace(/data:[^"']+/gi, '')
      // Remove iframe tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove object tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      // Remove embed tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      // Replace potentially dangerous characters
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  );
}

/**
 * Sanitizes a string for use in SQL queries to prevent SQL injection
 *
 * Note: This is a basic implementation. For real SQL queries,
 * always use parameterized queries instead of string concatenation.
 *
 * @param str The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeSql(str: string): string {
  if (!str) return '';

  // Replace single quotes with two single quotes (SQL escape)
  return str.replace(/'/g, "''");
}

/**
 * Sanitizes a string for use in file paths to prevent path traversal attacks
 *
 * @param path The path string to sanitize
 * @returns Sanitized path string
 */
export function sanitizePath(path: string): string {
  if (!path) return '';

  // Remove path traversal sequences and normalize
  return path
    .replace(/\.\.\//g, '') // Remove "../"
    .replace(/\.\.\\/g, '') // Remove "..\"
    .replace(/\/\//g, '/'); // Replace "//" with "/"
}

/**
 * Sanitizes a string for use in JSON to prevent JSON injection
 *
 * @param str The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeJson(str: string): string {
  if (!str) return '';

  // Replace control characters that could break JSON parsing
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\\"/g, '\\"'); // Escape quotes
}
