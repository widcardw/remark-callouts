import { describe, it, expect } from 'vitest'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { plugin } from '../src/index'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const md = `
> [!example] abc **q**
> def
>
> ghi`

const md2 = `
> a
>
> c`

describe('generate blockquote', () => {
  it('should generate node', async () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)
      .use(remarkRehype)
      .use(rehypeStringify)
    expect(String(await processor.process(md))).toMatchInlineSnapshot(`
      "<div><details class=\\"callout example\\">
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abc <strong>q</strong></div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>def</p><p>ghi</p></div>
      </details></div>"
    `)
  })
})

describe('do not generate', () => {
  it('should generate node', async () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)
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