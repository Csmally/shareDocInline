type TextStyle = {
  bold?: boolean;
  italic?: boolean;
};

type ASTNode = {
  type: "text" | "paragraph" | "mention" | "custom";
  content?: string;
  styles?: TextStyle;
  children?: ASTNode[];
  data?: any;
};

const parseHTML = (html: string): ASTNode[] => {
  const parser = new DOMParser();
  console.log("9898-html", html);
  const doc = parser.parseFromString(html, "text/html");
  console.log("9898-doc", doc);

  function parseNode(node: Node): ASTNode | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return { type: "text", content: node.textContent || "", styles: {} };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      switch (element.tagName.toLowerCase()) {
        case "p":
          return {
            type: "paragraph",
            children: Array.from(element.childNodes)
              .map(parseNode)
              .filter(Boolean) as ASTNode[],
          };
        case "strong":
        case "b":
          return {
            type: "text",
            content: element.textContent || "",
            styles: { bold: true },
          };
        case "em":
        case "i":
          return {
            type: "text",
            content: element.textContent || "",
            styles: { italic: true },
          };
        case "span":
          if (element.classList.contains("mention")) {
            return {
              type: "mention",
              content: element.textContent || "",
              data: { id: element.getAttribute("data-id") },
            };
          } else if (element.classList.contains("custom")) {
            return {
              type: "custom",
              content: element.textContent || "",
              data: { customData: element.getAttribute("data-custom") },
            };
          }
        default:
          return {
            type: "text",
            content: element.textContent || "",
            styles: {},
          };
      }
    }

    return null;
  }

  return Array.from(doc.body.childNodes)
    .map(parseNode)
    .filter(Boolean) as ASTNode[];
};

const renderAST = (ast: ASTNode[]): string => {
  return ast
    .map((node) => {
      switch (node.type) {
        case "text": {
          let content = node.content || "";
          if (node.styles?.bold) {
            content = `<strong>${content}</strong>`;
          }
          if (node.styles?.italic) {
            content = `<em>${content}</em>`;
          }
          return content;
        }
        case "paragraph":
          return `<p>${renderAST(node.children || [])}</p>`;
        case "mention":
          return `<span class="mention" data-id="${node.data?.id}">${node.content}</span>`;
        case "custom":
          return `<span class="custom" data-custom="${node.data?.customData}">${node.content}</span>`;
        default:
          return "";
      }
    })
    .join("");
};
export { parseHTML, renderAST };
export type { ASTNode };
