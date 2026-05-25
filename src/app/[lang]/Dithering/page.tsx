import { redirect } from "next/navigation";

export default async function DitheringIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/Dithering/Image`);
}
