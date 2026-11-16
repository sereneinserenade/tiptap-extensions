import defaultMdxComponents from 'fumadocs-ui/mdx';
import { createGenerator } from 'fumadocs-typescript';
import { AutoTypeTable, type AutoTypeTableProps } from 'fumadocs-typescript/ui';
import type { MDXComponents } from 'mdx/types';
import * as demos from '@/components/demos';

const generator = createGenerator();

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...demos,
    AutoTypeTable: (props: Omit<AutoTypeTableProps, 'generator'>) => (
      <AutoTypeTable
        {...props}
        generator={generator}
        // otherwise short types like boolean collapse to "union"
        options={{ typeSimplifier: { shouldSimplify: ({ checker, type, location }) => checker.typeToString(type, location).length > 40 } }}
      />
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
