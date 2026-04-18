import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Code, Parent } from 'mdast'

const remarkMermaid: Plugin = () => (tree: any) => {
  visit(tree as Root, 'code', (node: Code, index: number | undefined, parent: Parent | undefined) => {
    if (node.lang === 'mermaid' && parent && index !== undefined) {
      ;(parent.children as any[])[index] = {
        type: 'html',
        value: `<div class="mermaid">${node.value}</div>`,
      }
    }
  })
}

export default remarkMermaid
