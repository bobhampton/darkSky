interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Renders Schema.org structured data inline, so it's part of the prerendered HTML
 * that crawlers read without running JavaScript.
 */
export function JsonLd({ data }: JsonLdProps) {
  // Escape "<" so the JSON can never close the script tag early
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
