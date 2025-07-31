import React, { useState, useRef, useEffect } from "react";
import { compare } from "fast-json-patch";
import { parseHTML, renderAST, type ASTNode } from "@/utils/parseHtml";

export default function AdvancedRichTextEditor() {
  const [ast, setAST] = useState<ASTNode[]>([]);
  const [undoStack, setUndoStack] = useState<ASTNode[][]>([]);
  const [redoStack, setRedoStack] = useState<ASTNode[][]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setAST(parseHTML(html));
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const newAST = parseHTML(editorRef.current.innerHTML);
      const patches = compare(ast, newAST);
      console.log("JSON Patch:", patches);
      setUndoStack((prevStack) => [...prevStack, ast]);
      setRedoStack([]);
      setAST(newAST);
    }
  };

  const applyFormat = (format: "bold" | "italic") => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const newNode = document.createElement(
        format === "bold" ? "strong" : "em"
      );

      // 检查是否有部分选中的节点
      const partiallySelectedNodes = getPartiallySelectedNodes(range);

      if (partiallySelectedNodes.length > 0) {
        // 处理部分选中的节点
        partiallySelectedNodes.forEach((node) => {
          const nodeRange = document.createRange();
          if (node === range.startContainer) {
            nodeRange.setStart(node, range.startOffset);
            nodeRange.setEnd(node, (node as Text).length);
          } else if (node === range.endContainer) {
            nodeRange.setStart(node, 0);
            nodeRange.setEnd(node, range.endOffset);
          } else {
            nodeRange.selectNodeContents(node);
          }
          nodeRange.surroundContents(newNode.cloneNode() as HTMLElement);
        });
      } else {
        // 如果没有部分选中的节点，使用原来的方法
        range.surroundContents(newNode);
      }

      handleInput();
    }
  };

  const getPartiallySelectedNodes = (range: Range): Node[] => {
    const nodes: Node[] = [];
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (
        range.intersectsNode(node) &&
        (node !== range.startContainer || range.startOffset > 0) &&
        (node !== range.endContainer || range.endOffset < (node as Text).length)
      ) {
        nodes.push(node);
      }
    }

    return nodes;
  };

  const insertMention = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const mentionNode = document.createElement("span");
      mentionNode.className = "mention";
      mentionNode.setAttribute("data-id", "user123");
      mentionNode.textContent = "@User";
      range.insertNode(mentionNode);
      range.setStartAfter(mentionNode);
      handleInput();
    }
  };

  const insertCustomNode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const customNode = document.createElement("span");
      customNode.className = "custom";
      customNode.setAttribute("data-custom", "customData123");
      customNode.textContent = "[Custom Node]";
      range.insertNode(customNode);
      range.setStartAfter(customNode);
      handleInput();
    }
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const prevAST = undoStack[undoStack.length - 1];
      setRedoStack((prevStack) => [...prevStack, ast]);
      setAST(prevAST);
      setUndoStack((prevStack) => prevStack.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextAST = redoStack[redoStack.length - 1];
      setUndoStack((prevStack) => [...prevStack, ast]);
      setAST(nextAST);
      setRedoStack((prevStack) => prevStack.slice(0, -1));
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = renderAST(ast);
      // 修复光标位置
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.addRange(range);
      }
    }
  }, [ast]);

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#3B82F6",
    color: "white",
    borderRadius: "4px",
    border: "none",
    marginRight: "8px",
    cursor: "pointer",
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#9CA3AF",
    cursor: "not-allowed",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <button style={buttonStyle} onClick={() => applyFormat("bold")}>
          加粗
        </button>
        <button style={buttonStyle} onClick={() => applyFormat("italic")}>
          斜体
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#10B981" }}
          onClick={insertMention}
        >
          插入@提及
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#8B5CF6" }}
          onClick={insertCustomNode}
        >
          插入自定义节点
        </button>
        <button
          style={undoStack.length === 0 ? disabledButtonStyle : buttonStyle}
          onClick={undo}
          disabled={undoStack.length === 0}
        >
          撤销
        </button>
        <button
          style={redoStack.length === 0 ? disabledButtonStyle : buttonStyle}
          onClick={redo}
          disabled={redoStack.length === 0}
        >
          重做
        </button>
      </div>
      <div
        ref={editorRef}
        style={{
          border: "1px solid #E5E7EB",
          padding: "1rem",
          minHeight: "200px",
        }}
        contentEditable
        onInput={handleInput}
      />
      <div style={{ marginTop: "1rem" }}>
        <pre>
          undoStack:
          <code>{JSON.stringify(undoStack, null, 2)}</code>
          redoStack:
          <code>{JSON.stringify(redoStack, null, 2)}</code>
        </pre>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "bold" }}>AST 结构：</h3>
        <pre
          style={{
            backgroundColor: "#F3F4F6",
            padding: "1rem",
            borderRadius: "0.25rem",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(ast, null, 2)}
        </pre>
      </div>
    </div>
  );
}
