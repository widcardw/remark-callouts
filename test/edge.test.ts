import { describe, it, expect } from 'vitest'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { remarkCallouts } from '../src/index'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

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
  
    it('should generate blank line', async () => {
      expect(String(await processor.process('> [!tip] abc\n>\n> def\n\nghi'))).toMatchInlineSnapshot(`
        "<details class=\\"callout tip\\" open>
        <summary class=\\"callout-title\\"><div class=\\"callout-icon\\"></div><div class=\\"callout-title-content\\">abc</div><div class=\\"callout-fold\\"></div></summary>
        <div class=\\"callout-content\\"><p>def</p></div>
        </details>
        <p>ghi</p>"
      `)
    })
  })