"use dom";
import "./styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import ExampleTheme from "./ExampleTheme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { $getRoot, $createTextNode, $createParagraphNode } from "lexical";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $createCodeNode, CodeNode } from "@lexical/code";
import { $createLinkNode, LinkNode } from "@lexical/link";
import { $createListNode, $createListItemNode, ListNode, ListItemNode } from "@lexical/list";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

const placeholder = "Enter some rich text...";

function initialEditorState() {
  const root = $getRoot();
  root.clear();

  // H1 헤딩
  const heading1 = $createHeadingNode('h1');
  heading1.append($createTextNode("Lexical Rich Text Editor"));

  // H2 헤딩
  const heading2 = $createHeadingNode('h2');
  heading2.append($createTextNode("텍스트 포맷팅 예제"));

  // 일반 텍스트 단락 (굵은 텍스트, 기울임 텍스트 포함)
  const paragraph1 = $createParagraphNode();
  const boldText = $createTextNode("굵은 텍스트");
  boldText.setFormat(1); // BOLD
  const italicText = $createTextNode("기울임 텍스트");
  italicText.setFormat(2); // ITALIC
  paragraph1.append(
    $createTextNode("일반 텍스트와 함께 "),
    boldText,
    $createTextNode(" 그리고 "),
    italicText,
    $createTextNode("를 사용할 수 있습니다.")
  );

  // 링크가 포함된 단락
  const paragraph2 = $createParagraphNode();
  const link = $createLinkNode("https://lexical.dev");
  link.append($createTextNode("Lexical 공식 사이트"));
  paragraph2.append(
    $createTextNode("더 자세한 정보는 "),
    link,
    $createTextNode("에서 확인하세요.")
  );

  // 인용구
  const quote = $createQuoteNode();
  quote.append($createTextNode("이것은 인용구입니다. 중요한 텍스트를 강조할 때 유용합니다."));

  // 코드 블록
  const codeBlock = $createCodeNode("javascript");
  codeBlock.append($createTextNode("const hello = 'world';\nconsole.log(hello);"));

  // 빈 단락 (구분을 위해)
  const separator1 = $createParagraphNode();
  const separator2 = $createParagraphNode();

  // 체크리스트
  const checkList = $createListNode("check");
  const checkItem1 = $createListItemNode(true);
  checkItem1.append($createTextNode("완료된 작업"));
  const checkItem2 = $createListItemNode(true);
  checkItem2.append($createTextNode("진행 중인 작업"));
  const checkItem3 = $createListItemNode(false);
  checkItem3.append($createTextNode("해야 할 작업"));
  checkList.append(checkItem1, checkItem2, checkItem3);

  // 불릿 리스트
  const bulletList = $createListNode("bullet");
  const bulletItem1 = $createListItemNode();
  bulletItem1.append($createTextNode("첫 번째 항목"));
  const bulletItem2 = $createListItemNode();
  bulletItem2.append($createTextNode("두 번째 항목"));
  const bulletItem3 = $createListItemNode();
  bulletItem3.append($createTextNode("세 번째 항목"));
  bulletList.append(bulletItem1, bulletItem2, bulletItem3);

  // 모든 요소를 root에 추가
  root.append(heading1);
  root.append(heading2);
  root.append(paragraph1);
  root.append(paragraph2);
  root.append(quote);
  root.append(codeBlock);
  root.append(separator1);
  root.append(checkList);
  root.append(separator2);
  root.append(bulletList);
}

const editorConfig = {
  namespace: "React.js Demo",
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
  editorState: initialEditorState,
  nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode, CodeNode, LinkNode],
};
export default function Editor({
  setPlainText,
  setEditorState,
}: {
  setPlainText: React.Dispatch<React.SetStateAction<string>>;
  setEditorState: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="editor-placeholder">{placeholder}</div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin
              onChange={(editorState, editor, tags) => {
                editorState.read(() => {
                  const root = $getRoot();
                  const textContent = root.getTextContent();
                  setPlainText(textContent);
                });
                setEditorState(JSON.stringify(editorState.toJSON()));
              }}
              ignoreHistoryMergeTagChange
              ignoreSelectionChange
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <CheckListPlugin />
            {/* <TreeViewPlugin /> */}
          </div>
        </div>
      </LexicalComposer>
    </>
  );
}
