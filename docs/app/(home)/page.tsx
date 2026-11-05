import Link from 'next/link';
import { TrackChangesDemo } from '@/components/demos';
import { extensions } from '@/lib/extensions';

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 md:py-24">
      <section className="flex flex-col items-center text-center">
        <p className="mb-4 rounded-full border px-3 py-1 text-xs text-fd-muted-foreground">For Tiptap 3 · MIT · No framework required</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Tiptap Extensions</h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          Nine editor extensions in one tree-shakable package. Import what you use and nothing else reaches your bundle.
        </p>
        <code className="mt-8 rounded-lg border bg-fd-card px-4 py-2 text-sm">npm i @sereneinserenade/tiptap-extensions</code>
        <div className="mt-6 flex gap-3">
          <Link href="/docs" className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground">
            Get started
          </Link>
          <a href="https://github.com/sereneinserenade/tiptap-extensions" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-fd-accent">
            GitHub
          </a>
        </div>
      </section>

      <section className="mt-16">
        <TrackChangesDemo />
      </section>

      <section className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {extensions.map((e) => (
          <Link
            key={e.slug}
            href={`/docs/${e.slug}`}
            className="rounded-xl border bg-fd-card p-4 transition-colors hover:border-fd-primary"
          >
            <h2 className="font-semibold">{e.title}</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">{e.summary}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
