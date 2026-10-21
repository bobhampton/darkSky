import { isValidElement, type ReactNode } from 'react';

/**
 * Extracts the visible text from simple JSX (strings, fragments and DOM elements),
 * e.g. to reuse a formatted answer as plain text in structured data.
 * Components aren't rendered, so only their `children` contribute text.
 * @param node - React node to read
 * @returns Text content with whitespace collapsed
 */
export function getNodeText(node: ReactNode): string {
  const collect = (value: ReactNode): string => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(collect).join('');
    }
    if (isValidElement<{ children?: ReactNode }>(value)) {
      return collect(value.props.children);
    }
    return '';
  };

  return collect(node).replace(/\s+/g, ' ').trim();
}
