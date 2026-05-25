import { redirect } from "next/navigation";

export default async function LegacyAlgorithmsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/Education`);
}
