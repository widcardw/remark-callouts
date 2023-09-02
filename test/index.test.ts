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

describe.skip('generate blockquote', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeStringify)

  it('should generate complex node', async () => {
    expect(String(await processor.process(md))).toMatchInlineSnapshot(`
      "<p>paragraph</p>
      <details class=\\"callout example\\">
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abc <strong>q</strong></div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>def</p><p>ghi</p></div>
      </details>"
    `)
  })

  it('should generate simple node', async () => {
    expect(String(await processor.process(md3))).toMatchInlineSnapshot(`
      "<details class=\\"callout note\\" open>
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">Note</div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>a</p></div>
      </details>"
    `)
  })

  it('should generate code blockquote', async () => {
    expect(String(await processor.process(md4))).toMatchInlineSnapshot(`
      "<details class=\\"callout note\\">
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abcd</div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><pre><code class=\\"language-c\\">int main()
      </code></pre></div>
      </details>"
    `)
  })
})

describe.skip('do not generate', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeStringify)

  it('should generate node', async () => {
    expect(String(await processor.process(md2))).toMatchInlineSnapshot(`
      "<blockquote>
      <p>a</p>
      <p>c</p>
      </blockquote>"
    `)
  })

  it('should generate single line', async () => {
    expect(String(await processor.process(md5))).toMatchInlineSnapshot(`
        "<details class=\\"callout bug\\" open>
        <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">Cannot load module <code>/path/to/node_modules/mermaid/dist/mermaid.js</code></div><div class=\\"callout-fold\\"></div></summary>
        </details>"
      `)
  })
})

describe('edge cases', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeStringify)

  it('shoud generate node', async () => {
    expect(String(await processor.process('> [!tip] abc\n> def\n\nghi'))).toMatchInlineSnapshot(`
      "<details class=\\"callout tip\\" open>
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abc</div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>def</p></div>
      </details>
      <p>ghi</p>"
    `)
  })

  it ('should generate blank line', async () => {
    expect(String(await processor.process('> [!tip] abc\n>\n> def\n\nghi'))).toMatchInlineSnapshot(`
      "<details class=\\"callout tip\\" open>
      <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abc</div><div class=\\"callout-fold\\"></div></summary>
      <div class=\\"callout-content\\"><p>def</p></div>
      </details>
      <p>ghi</p>"
    `)
  })
})