'use client';
import type { AnyExtension } from '@tiptap/core';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { ComponentProps, DependencyList, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const useDemoEditor = (extensions: AnyExtension[], content: string, deps: DependencyList = []) =>
  useEditor({ extensions: [StarterKit, ...extensions], content, immediatelyRender: false }, deps);

export function DemoFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('not-prose my-6 rounded-xl border bg-fd-card p-4 text-sm', className)}>{children}</div>;
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex flex-wrap items-center gap-2">{children}</div>;
}

export function Split({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_240px]">{children}</div>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-fd-muted-foreground">{children}</p>;
}

const control = 'rounded-md border bg-fd-background px-2.5 py-1.5 text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

export function Button({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      // keep the editor selection when clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      className={cn(control, 'cursor-pointer font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-50', className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'min-w-0', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(control, className)} {...props} />;
}

export function Checkbox({ label, ...props }: ComponentProps<'input'> & { label: string }) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <input type="checkbox" className="size-4 accent-fd-primary" {...props} />
      {label}
    </label>
  );
}

export function EditorSurface({ editor }: { editor: Editor | null }) {
  return <EditorContent editor={editor} className="demo-editor" />;
}
