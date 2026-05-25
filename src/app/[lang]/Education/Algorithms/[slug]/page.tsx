import type { Metadata } from "next";
import AlgorithmDetail from "../../../../../views/AlgorithmDetail";
import { algorithmMetadata } from "../../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  return algorithmMetadata(lang, slug);
}

export default function AlgorithmDetailPage() {
  return <AlgorithmDetail />;
}
