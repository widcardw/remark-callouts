import type { Plugin } from 'unified'
import type { Parent } from 'unist'
import { BuildVisitor, visit } from 'unist-util-visit'
import type { Blockquote, Text, BlockContent, Node } from 'mdast'

const BLANK_REG = /[\t ]*(?:\r?\n|\r)/g

function visitLeading(ast: Node) {
  const visitor: BuildVisitor<Node, 'text'> = (node: Text, index: number, parent: Parent) => {
    const result = []
    let start = 0
    BLANK_REG.lastIndex = 0

    let match = BLANK_REG.exec(node.value)

    while (match) {
      const position = match.index

      if (start !== position) {
        result.push({
          type: "text",
          value: node.value.slice(start, position),
        })
      }

      result.push({ type: "break" })
      start = position + match[0].length
      match = BLANK_REG.exec(node.value)
    }

    if (result.length > 0 && parent && typeof index === "number") {
      if (start < node.value.length) {
        result.push({ type: "text", value: node.value.slice(start) })
      }

      parent.children.splice(index, 1, ...result)
      return index + result.length
    }
  }
  return visit(ast, 'text', visitor)
}

function visitBlock(ast: Node) {
  const visitor: BuildVisitor<Node, 'blockquote'> = (node: Blockquote, index: number, parent: Parent) => {
    visitLeading(node)

    // wrap blockquote in a div
    const wrapper = {
      ...node,
      type: "element",
      tagName: "div",
      data: {
        hProperties: {},
      },
      children: [node],
    }

    parent.children.splice(Number(index), 1, wrapper)

    const blockquote = wrapper.children[0] as Blockquote

    // check for callout syntax starts here
    if (
      blockquote.children.length <= 0 ||
      blockquote.children[0].type !== "paragraph"
    )
      return
    const paragraph = blockquote.children[0]

    if (
      paragraph.children.length <= 0 ||
      paragraph.children[0].type !== "text"
    )
      return

    let [t, ...rest] = paragraph.children

    const regex = new RegExp(
      `^\\[!(?<keyword>(.*?))(\\|(?<open>(open|closed)))?\\][\t\f ]?(?<title>.*?)$`,
      "gi"
    )
    const m = regex.exec(t.value)

    // if no callout syntax, forget about it.
    if (!m) return

    const [key, title, open] = [m.groups?.keyword, m.groups?.title, m.groups?.open]

    // if there's nothing inside the brackets, is it really a callout ?
    if (!key) return

    const keyword = key.toLowerCase()

    let titleNode = {
      type: 'element',
      tagName: 'div',
      children: [] as any[],
      data: {
        hProperties: {
          className: 'callout-title-content'
        }
      }
    }
    const indexOfBreak = paragraph.children.findIndex(i => i.type === 'break')
    if (indexOfBreak !== -1) rest = paragraph.children.slice(indexOfBreak + 1)
    if (title && title.trim() !== '') {
      if (indexOfBreak !== -1) {
        paragraph.children[0].value = paragraph.children[0].value.replace(new RegExp(`\\[!${key}\\][\t\f ]*`, 'i'), '')
        titleNode.children.push(...paragraph.children.slice(0, indexOfBreak))
      }
      else {
        titleNode.children.push({ type: 'text', value: title })
      }
    }
    else {
      titleNode.children.push({
        type: 'text',
        value: keyword.charAt(0).toUpperCase() + keyword.slice(1)
      })
    }

    const fullTitleNode = {
      type: 'element',
      children: [
        { type: 'element', tagName: 'div', data: { hProperties: { className: 'callout-icon' } } },
        titleNode,
        { type: 'element', tagName: 'div', data: { hProperties: { className: 'callout-fold' } } }
      ],
      data: {
        hProperties: {
          className: `callout-title`,
        },
        hName: 'summary',
      }
    }

    const contentChildren = [...blockquote.children.slice(1)]
    if (rest.length) contentChildren.unshift({ type: 'paragraph', children: rest })

    const contentNode = {
      type: "element",
      children: contentChildren,
      data: {
        hProperties: {
          className: "callout-content",
        },
      },
    }
    blockquote.children = [fullTitleNode, contentNode] as BlockContent[]

    const hProperties = {
      className: `callout ${keyword}`
    }

    if (open === 'open'
      || (key !== 'example' && open !== 'closed'))
      Object.assign(hProperties, { open: true }, hProperties)

    blockquote.data = {
      ...blockquote.data,
      hName: 'details',
      hProperties,
    }
  }

  return visit(ast, 'blockquote', visitor)
}

const plugin: Plugin = function () {
  return function transformer(ast: Node, vFile: any, next: any) {
    visitBlock(ast)
    if (typeof next === 'function')
      return next(null, ast, vFile)
    return ast
  }
}

export {
  plugin as remarkCallouts
}