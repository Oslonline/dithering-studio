import { redirect } from "next/navigation";

export default async function AdminGalleryRedirectPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/Account?panel=admin-moderation`);
}
