import type { Metadata } from "next";
import Link from "next/link";
import { sk } from "@/i18n/sk";

export const metadata: Metadata = { title: `${sk.privacy.title} – ${sk.meta.title}` };

export default function PrivacyPage() {
  const t = sk.privacy;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <ul className="flex flex-col gap-4">
        {t.items.map((item) => (
          <li key={item.title} className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 leading-relaxed">{item.text}</p>
          </li>
        ))}
        <li className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t.contact.title}</h2>
          <p className="mt-1 leading-relaxed">
            {t.contact.text}{" "}
            {/* TODO(beta): placeholder address – replace in sk.privacy.contact.email before launch. */}
            <a href={`mailto:${t.contact.email}`} className="break-all text-accent underline underline-offset-4">
              {t.contact.email}
            </a>
          </p>
        </li>
      </ul>
      <Link href="/" className="flex min-h-11 items-center self-start text-accent underline underline-offset-4">
        {sk.common.backHome}
      </Link>
    </main>
  );
}
