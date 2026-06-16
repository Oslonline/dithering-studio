type JsonValue = Record<string, unknown>;

export default function JsonLd({ data }: { data: JsonValue | JsonValue[] }) {
  const graph = Array.isArray(data) ? data : [data];
  const payload = graph.length === 1 ? graph[0] : graph;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
