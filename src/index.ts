import { Plugin } from "unified";
import { Blockquote, Node, Paragraph, Parent, Root, Text } from 'mdast'
import { BuildVisitor, visit } from "unist-util-visit";

const REG = new RegExp(
  `^\\[!(?<keyword>(.*?))(\\|(?<open>(open|closed)))?\\][\t\f ]?(?<title>.*?)$`,
  "i"
)

const CALLOUTTITLE = '__callout-title'

interface CalloutConfig {
  key: string
  open: string | undefined
}

interface CalloutNode {
  type: string
  children: Node[]
  data: { calloutConfig: CalloutConfig }
}

interface CalloutParameters {
  leadingIcon?: boolean
  foldIcon?: boolean
  customClass?: string
}

function visitLeading(ast: Node) {
  const visitor: BuildVisitor<Node, 'paragraph'> = (node: Paragraph, index: number, parent: Parent) => {
    const titleNodes = []
    const children = node.children
    let i = 0
    let flag = -1
    for (; i < children.length; i++) {
      const child = children[i]
      if (child.type !== 'text' || (child.type === 'text' && !child.value.includes('\n'))) {
        titleNodes.push(child)
        continue
      }
      if (/* child.type === 'text' && */ child.value.includes('\n'))
        flag = child.value.indexOf('\n')
      break
    }

    const restNodes = children.slice(i)

    if (flag !== -1) {
      titleNodes.push({ type: 'text', value: (children[i] as Text).value.slice(0, flag) });
      (restNodes[0] as Text).value = (children[i] as Text).value.slice(flag + 1);
    }

    if (titleNodes.length === 0) return

    const firstChild = titleNodes[0]
    // only match text nodes
    if (firstChild.type !== 'text') return

    // deprecated because the flag already implement the split feature
    // if (firstChild.value.includes('\n')) {
    //   const [i, j] = firstChild.value.split('\n')
    //   firstChild.value = i
    //   j && restNodes.push({ type: 'text', value: j })
    // }

    // only match [!xxx] like nodes
    const m = firstChild.value.match(REG)
    if (!m) return
    const [key, title, open] = [m.groups?.keyword, m.groups?.title, m.groups?.open]
    if (!key) return
    // remove the [!xxx] like label
    if (!title) titleNodes.shift()
    else firstChild.value = title

    // replace the title nodes and the rest nodes
    const titleNode: any = {
      type: CALLOUTTITLE,
      children: titleNodes,
      data: {
        calloutConfig: { key, open },
      }
    }
    if (restNodes.length > 0 && restNodes[0].type === 'text')
      restNodes[0].value = restNodes[0].value.replace(/^\n/, '')
    let restNode: Paragraph
    const f = [titleNode]
    if (restNodes.length > 0) {
      restNode = {
        type: 'paragraph',
        children: restNodes,
      }
      f.push(restNode)
    }
    parent.children.splice(index, 1, ...f)
  }
  return visit(ast, 'paragraph', visitor)
}

function visitBlock(ast: Node, config: CalloutParameters) {
  const visitor: BuildVisitor<Node, 'blockquote'> = (node: Blockquote, index: number, parent: Root) => {
    visitLeading(node)
    const firstChild = node.children[0] as CalloutNode
    if (firstChild.type !== CALLOUTTITLE) return
    const calloutConfig = firstChild.data.calloutConfig
    const { key, open } = calloutConfig
    const keyword = key.toLowerCase()

    const titleContent = {
      type: 'element',
      children: firstChild.children.length ? firstChild.children : [{ type: 'text', value: keyword.charAt(0).toUpperCase() + keyword.slice(1) }],
      data: {
        hProperties: {
          className: 'callout-title-content',
        }
      }
    }

    const titleChildren: any[] = [titleContent]
    if (config.leadingIcon)
      titleChildren.unshift(
        { type: 'element', data: { hProperties: { className: 'callout-icon' } } }
      )

    const titleNode = {
      type: 'element',
      children: titleChildren,
      data: {
        hProperties: {
          className: ['callout-title', config.customClass],
        },
        hName: 'summary'
      }
    }

    const calloutBody = node.children.slice(1)
    const calloutNode = {
      type: 'element',
      children: calloutBody,
      data: {
        hProperties: {
          className: ['callout-content', config.customClass]
        }
      }
    }

    let hProperties = {
      className: [`callout ${keyword}`, config.customClass]
    }

    if (open === 'open'
      || (key !== 'example' && open !== 'closed'))
      Object.assign(hProperties, { open: true }, hProperties)

    const children: any[] = [titleNode]
    if (calloutBody.length > 0) {
      children.push(calloutNode)
      if (config.foldIcon)
        titleNode.children.push({ type: 'element', data: { hProperties: { className: 'callout-fold' } } })
    }
    node.children = children
    node.data = {
      ...node.data,
      hName: 'details',
      hProperties,
    }
  }
  return visit(ast, 'blockquote', visitor)
}

const plugin = (cfg: CalloutParameters = {}) => {
  const leadingIcon = cfg.leadingIcon !== undefined ? cfg.leadingIcon : true
  const foldIcon = cfg.foldIcon !== undefined ? cfg.foldIcon : true
  const customClass = cfg.customClass !== undefined ? cfg.customClass : ''
  
  return function transformer(ast: Node, vFile: any, next: any) {
    visitBlock(ast, { leadingIcon, foldIcon, customClass })
    if (typeof next === 'function')
      return next(null, ast, vFile)
    return ast
  }
}

export {
  plugin as remarkCallouts
}