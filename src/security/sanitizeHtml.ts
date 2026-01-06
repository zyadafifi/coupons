/**
 * SECURITY: HTML Sanitization Utility
 * 
 * This module provides secure HTML sanitization using DOMPurify to prevent XSS attacks.
 * All user-generated or admin-created HTML content MUST be sanitized before rendering.
 * 
 * Usage:
 *   import { sanitizeHtml } from '@/security/sanitizeHtml';
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }} />
 */

import DOMPurify from 'dompurify';

/**
 * Strict sanitization config for user-facing content
 * Only allows safe formatting tags, no scripts or event handlers
 */
const STRICT_CONFIG: DOMPurify.Config = {
  // Allow only safe formatting tags
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'b', 'i', 'u', 's', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a',
  ],
  
  // Allow only safe attributes
  ALLOWED_ATTR: [
    'class', 'id', 'style',
    'href', 'title', 'target', 'rel',
  ],
  
  // Strictly forbid dangerous tags
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
    'textarea', 'select', 'option', 'style', 'link', 'meta', 'base',
  ],
  
  // Strictly forbid event handlers and javascript: URLs
  FORBID_ATTR: [
    'onerror', 'onclick', 'onload', 'onmouseover', 'onmouseout', 'onmousemove',
    'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange', 'oninput',
    'onsubmit', 'onreset', 'onkeydown', 'onkeyup', 'onkeypress', 'ondblclick',
    'oncontextmenu', 'ondrag', 'ondrop', 'onwheel', 'onscroll', 'ontouchstart',
    'ontouchend', 'ontouchmove', 'onpointerdown', 'onpointerup', 'onpointermove',
  ],
  
  // Additional security options
  ALLOW_DATA_ATTR: false, // Don't allow data-* attributes
  ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow http, https, mailto
  SAFE_FOR_TEMPLATES: true, // Extra safety for template context
  WHOLE_DOCUMENT: false, // Only sanitize fragment, not full HTML document
  RETURN_DOM: false, // Return string, not DOM
  RETURN_DOM_FRAGMENT: false, // Return string, not DocumentFragment
  RETURN_TRUSTED_TYPE: false, // Return string
};

/**
 * Config for admin-created rich text content
 * Allows more formatting but still blocks scripts and dangerous content
 */
const RICH_TEXT_CONFIG: DOMPurify.Config = {
  ...STRICT_CONFIG,
  
  // Allow additional formatting tags for rich text editor
  ALLOWED_TAGS: [
    ...STRICT_CONFIG.ALLOWED_TAGS || [],
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'img', 'figure', 'figcaption',
    'sub', 'sup', 'small', 'del', 'ins',
    'hr',
  ],
  
  ALLOWED_ATTR: [
    ...STRICT_CONFIG.ALLOWED_ATTR || [],
    'src', 'alt', 'width', 'height',
    'colspan', 'rowspan',
  ],
};

/**
 * Config for dynamic CSS (e.g., charts)
 * Only allows CSS content, no HTML
 */
const CSS_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['style'],
  ALLOWED_ATTR: [],
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
    'textarea', 'select', 'option', 'link', 'meta', 'base',
    'a', 'img', 'video', 'audio', 'source',
  ],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
};

/**
 * Add hooks to enforce security policies
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Ensure all external links have rel="noopener noreferrer" for security
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href') || '';
    
    // Block javascript: URLs (defense in depth)
    if (href.toLowerCase().startsWith('javascript:')) {
      node.setAttribute('href', '#');
    }
    
    // For external links, add security attributes
    if (href.startsWith('http://') || href.startsWith('https://')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
  
  // Remove inline styles that could be dangerous
  if (node.hasAttribute('style')) {
    const style = node.getAttribute('style') || '';
    
    // Block dangerous CSS (javascript:, expression, etc.)
    if (
      style.toLowerCase().includes('javascript:') ||
      style.toLowerCase().includes('expression') ||
      style.toLowerCase().includes('import') ||
      style.toLowerCase().includes('url(')
    ) {
      node.removeAttribute('style');
    }
  }
});

/**
 * Sanitize HTML with strict config (for user-facing content)
 * 
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, STRICT_CONFIG);
}

/**
 * Sanitize rich text content (for admin-created content)
 * Allows more formatting but still secure
 * 
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeRichText(html: string | undefined | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG);
}

/**
 * Sanitize CSS content (for dynamic styles)
 * 
 * @param css - Raw CSS string to sanitize
 * @returns Sanitized CSS safe for rendering
 */
export function sanitizeCss(css: string | undefined | null): string {
  if (!css) return '';
  return DOMPurify.sanitize(css, CSS_CONFIG);
}

/**
 * Strip all HTML tags (for plain text extraction)
 * 
 * @param html - Raw HTML string
 * @returns Plain text with all HTML removed
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * Check if HTML contains potentially dangerous content
 * Returns true if content was modified during sanitization
 * 
 * @param html - Raw HTML string to check
 * @returns True if HTML contains dangerous content
 */
export function isDangerousHtml(html: string | undefined | null): boolean {
  if (!html) return false;
  const sanitized = sanitizeHtml(html);
  return sanitized !== html;
}

