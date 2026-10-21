/**
 * Unit tests for extracting plain text from JSX
 * Run with: npm test
 */

import { describe, test, expect } from 'vitest';
import { getNodeText } from '../nodeText';

describe('getNodeText', () => {
  test('returns strings and numbers as-is', () => {
    expect(getNodeText('Dark sky')).toBe('Dark sky');
    expect(getNodeText(18)).toBe('18');
  });

  test('reads text through fragments and nested elements', () => {
    expect(
      getNodeText(
        <>
          The sun is 18° below the horizon.{' '}
          <a href="/faq">
            Read the <strong>FAQ</strong>
          </a>
          .
        </>
      )
    ).toBe('The sun is 18° below the horizon. Read the FAQ.');
  });

  test('collapses whitespace and ignores empty values', () => {
    expect(getNodeText(['  one\n', null, false, undefined, '   two  '])).toBe('one two');
  });
});
