import { describe, it, expect } from 'vitest'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { remarkCallouts } from '../src/index'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const md = `
paragraph

> [!example] abc **q**
> def
>
> ghi`

const md2 = `
> a
>
> c`

const md3 = `
> [!note]
> a
`

describe('generate blockquote', () => {
  it('should generate node', async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkCallouts)
      .use(remarkRehype)
      .use(rehypeStringify)
    expect(String(await processor.process(md))).toMatchInlineSnapshot(`
      "<p>paragraph</p>
      <div><details class=\\"callout example\\">
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abc <strong>q</strong></div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>def</p><p>ghi</p></div>
      </details></div>"
    `)

    expect(String(await processor.process(md3))).toMatchInlineSnapshot(`
      "<div><details class=\\"callout note\\" open>
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div>Note<div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>a</p></div>
      </details></div>"
    `)
  })
})

describe('do not generate', () => {
  it('should generate node', async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkCallouts)
      .use(remarkRehype)
      .use(rehypeStringify)
    expect(String(await processor.process(md2))).toMatchInlineSnapshot(`
      "<div><blockquote>
      <p>a</p>
      <p>c</p>
      </blockquote></div>"
    `)
  })
})