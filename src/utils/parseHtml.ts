const parseNode = (node: Node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return {
      type: "text",
      content: node.textContent || "",
    };
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const blockType = element.getAttribute("data-block-type");
    console.log("9898-el", element.textContent);
    // const childrenNodes = Array.from(element.childNodes).map(parseNode);
    switch (blockType) {
      case "h1":
        return {
          type: "heanding",
          attrs: {
            level: 1,
          },
          content: element.textContent || "",
        };
      case "h2":
        return {
          type: "heanding",
          attrs: {
            level: 2,
          },
          content: element.textContent || "",
        };
      case "paragraph":
        return {
          type: "paragraph",
          content: element.textContent || "",
        };
      case "code":
        return {
          type: "code",
          content: element.textContent || "",
        };
      default:
        return null;
    }
  }
};

export const parseHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 获取所有节点
  const nodes = doc.body.childNodes;
  return Array.from(nodes).map(parseNode);
};
