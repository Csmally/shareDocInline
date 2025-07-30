import { parseHtml } from "../utils/parseHtml";

const jsonData = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Hello,",
        },
        {
          type: "text",
          text: "World!",
          styles: {
            bold: true,
          },
        },
        {
          type: "text",
          text: "字节跳动",
          styles: {
            bold: true,
            italic: true,
            underline: true,
            color: "red",
            backgroundColor: "pink",
          },
        },
      ],
    },
    {
      type: "code",
      content: [
        {
          text: "const a = ",
        },
        {
          text: "123",
        },
      ],
    },
  ],
};

function Editor() {
  const handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const html = ev.target.innerHTML;
    const ast = parseHtml(html);
    console.log("9898-ast", ast);
  };
  return (
    <div contentEditable onKeyDown={handleKeyDown}>
      {jsonData.content.map((node, index) => {
        switch (node.type) {
          case "paragraph":
            return (
              <div
                className="block docx-paragraph-block"
                key={index}
                data-block-type={node.type}
              >
                <p>
                  {node.content.map((childNode, childIndex) => (
                    <span
                      key={childIndex}
                      style={{
                        fontWeight: childNode.styles?.bold ? "bold" : "normal",
                        fontStyle: childNode.styles?.italic
                          ? "italic"
                          : "normal",
                        textDecoration: childNode.styles?.underline
                          ? "underline"
                          : "none",
                      }}
                    >
                      {childNode.text}
                    </span>
                  ))}
                </p>
              </div>
            );
          case "code":
            return (
              <div
                className="block docx-code-block"
                key={index}
                data-block-type={node.type}
              >
                <pre>{node.content.map((childNode) => childNode.text)}</pre>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default Editor;
