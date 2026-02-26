/**
 * Serializes a Shopify Rich Text metafield JSON string to an HTML string.
 *
 * Shopify Rich Text metafields store content as a JSON document tree.
 * This runs server-side in the loader so no extra client JS is shipped.
 *
 * Supported node types:
 *   root, heading, paragraph, list (unordered|ordered),
 *   list-item, text (bold/italic/code), link
 */

type TextNode = {
  type: 'text';
  value: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

type LinkNode = {
  type: 'link';
  url: string;
  title?: string;
  target?: string;
  children: RichTextNode[];
};

type ListNode = {
  type: 'list';
  listType: 'ordered' | 'unordered';
  children: RichTextNode[];
};

type HeadingNode = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: RichTextNode[];
};

type ParagraphNode = {type: 'paragraph'; children: RichTextNode[]};
type ListItemNode = {type: 'list-item'; children: RichTextNode[]};
type RootNode = {type: 'root'; children: RichTextNode[]};

type RichTextNode =
  | RootNode
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | TextNode
  | LinkNode
  | {type: string; children?: RichTextNode[]};

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nodeToHtml(node: RichTextNode): string {
  switch (node.type) {
    case 'root':
      return (node as RootNode).children.map(nodeToHtml).join('');

    case 'heading': {
      const h = node as HeadingNode;
      const inner = h.children.map(nodeToHtml).join('');
      return `<h${h.level}>${inner}</h${h.level}>`;
    }

    case 'paragraph': {
      const inner = (node as ParagraphNode).children.map(nodeToHtml).join('');
      // Skip empty paragraphs that Shopify sometimes adds
      if (!inner.trim()) return '';
      return `<p>${inner}</p>`;
    }

    case 'list': {
      const l = node as ListNode;
      const tag = l.listType === 'ordered' ? 'ol' : 'ul';
      const inner = l.children.map(nodeToHtml).join('');
      return `<${tag}>${inner}</${tag}>`;
    }

    case 'list-item': {
      const inner = (node as ListItemNode).children.map(nodeToHtml).join('');
      return `<li>${inner}</li>`;
    }

    case 'text': {
      const t = node as TextNode;
      let out = escape(t.value);
      if (t.bold) out = `<strong>${out}</strong>`;
      if (t.italic) out = `<em>${out}</em>`;
      if (t.code) out = `<code>${out}</code>`;
      return out;
    }

    case 'link': {
      const lk = node as LinkNode;
      const inner = lk.children.map(nodeToHtml).join('');
      const target = lk.target ? ` target="${escape(lk.target)}"` : '';
      const title = lk.title ? ` title="${escape(lk.title)}"` : '';
      return `<a href="${escape(lk.url)}"${target}${title}>${inner}</a>`;
    }

    default:
      // Unknown node with children — recurse to avoid losing content
      if ('children' in node && Array.isArray(node.children)) {
        return node.children.map(nodeToHtml).join('');
      }
      return '';
  }
}

/**
 * Convert a Shopify Rich Text metafield `value` string to HTML.
 * Returns an empty string if the value is missing or cannot be parsed.
 */
export function richTextToHtml(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const root = JSON.parse(value) as RichTextNode;
    return nodeToHtml(root);
  } catch {
    // Fallback: return the raw value if it's not valid JSON (e.g. plain text)
    return escape(value);
  }
}
