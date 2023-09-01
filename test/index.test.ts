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

const md4 = `
> [!note|closed] abcd
> \`\`\`c
> int main()
> \`\`\`
`

const md5 = '> [!bug] Cannot load module `/path/to/node_modules/mermaid/dist/mermaid.js`'

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
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">Note</div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>a</p></div>
      </details></div>"
    `)

    expect(String(await processor.process(md4))).toMatchInlineSnapshot(`
      "<div><details class=\\"callout note\\">
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abcd</div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><pre><code class=\\"language-c\\">int main()
      </code></pre></div>
      </details></div>"
    `)
    
    expect(String(await processor.process(md5))).toMatchInlineSnapshot(`
      "<div><details class=\\"callout bug\\" open>
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">Cannot load module </div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p><code>/path/to/node_modules/mermaid/dist/mermaid.js</code></p></div>
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