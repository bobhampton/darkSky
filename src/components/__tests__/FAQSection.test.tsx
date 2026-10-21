import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FAQSection } from '../FAQSection';

interface FAQSchema {
  mainEntity: { name: string; acceptedAnswer: { text: string } }[];
}

function renderSchema() {
  const { container } = render(<FAQSection />);
  const script = container.querySelector('script[type="application/ld+json"]')!;
  return { container, schema: JSON.parse(script.textContent!) as FAQSchema };
}

describe('FAQSection structured data', () => {
  test('includes every question with a non-empty answer', () => {
    const { container, schema } = renderSchema();

    expect(schema.mainEntity).toHaveLength(container.querySelectorAll('[id^="faq-answer-"]').length);
    for (const question of schema.mainEntity) {
      expect(question.acceptedAnswer.text, question.name).not.toBe('');
    }
  });

  test('matches the answer text shown on the page, including formatted answers', () => {
    const { container, schema } = renderSchema();

    schema.mainEntity.forEach((question, index) => {
      const shown = container.querySelector(`#faq-answer-${index}`)!.textContent!.replace(/\s+/g, ' ').trim();
      expect(question.acceptedAnswer.text).toBe(shown);
    });
  });
});
