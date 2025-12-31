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
import { $createListNode, $createListItemNode, ListNode, ListItemNode } from "@lexical/list";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

const placeholder = "Enter some rich text...";

function initialEditorState() {
  const root = $getRoot();
  root.clear();
  
  // 체크리스트 생성 (먼저)
  const checkList = $createListNode("check");
  const checkItem1 = $createListItemNode(true); // checked
  checkItem1.append($createTextNode("가나다"));
  const checkItem2 = $createListItemNode(true); // checked
  checkItem2.append($createTextNode("마바사"));
  const checkItem3 = $createListItemNode(false); // unchecked
  checkItem3.append($createTextNode("아자차파"));
  checkList.append(checkItem1, checkItem2, checkItem3);
  
  // 빈 단락 추가 (구분을 위해)
  const separator = $createParagraphNode();
  
  // 불릿 리스트 생성
  const bulletList = $createListNode("bullet");
  const item1 = $createListItemNode();
  item1.append($createTextNode("가나다"));
  const item2 = $createListItemNode();
  item2.append($createTextNode("마바사"));
  bulletList.append(item1, item2);
  
  root.append(checkList);
  root.append(separator);
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
  nodes: [ListNode, ListItemNode],
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
