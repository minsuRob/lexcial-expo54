"use dom";
import "./styles.css";

import { LexicalCollaboration } from '@lexical/react/LexicalCollaborationContext';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import * as Y from 'yjs';

import ExampleTheme from "./ExampleTheme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { $getRoot, $createTextNode, $createParagraphNode } from "lexical";
import { $createListNode, $createListItemNode, ListNode, ListItemNode } from "@lexical/list";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { createWebsocketProvider } from "./providers";

interface UserProfile {
  name: string;
  color: string;
}

interface ActiveUserProfile extends UserProfile {
  userId: number;
}

const placeholder = "Enter some collaborative rich text...";

function initialEditorState() {
  const root = $getRoot();
  root.clear();

  // 기본 텍스트 추가
  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode("Welcome to collaborative editing!"));
  root.append(paragraph);
}

const editorConfig = {
  // NOTE: This is critical for collaboration plugin to set editor state to null. It
  // would indicate that the editor should not try to set any default state
  // (not even empty one), and let collaboration plugin do it instead
  editorState: null,
  namespace: 'React.js Collab Demo',
  nodes: [ListNode, ListItemNode],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

function getRandomUserProfile(): UserProfile {
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  return {
    name: names[Math.floor(Math.random() * names.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

export default function CollaborativeEditor({
  setPlainText,
  setEditorState,
}: {
  setPlainText: React.Dispatch<React.SetStateAction<string>>;
  setEditorState: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [userProfile, setUserProfile] = useState(() => getRandomUserProfile());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [yjsProvider, setYjsProvider] = useState<null | any>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUserProfile[]>([]);

  const handleAwarenessUpdate = useCallback(() => {
    if (!yjsProvider?.awareness) return;

    const awareness = yjsProvider.awareness;
    setActiveUsers(
      Array.from(awareness.getStates().entries()).map(
        ([userId, {color, name}]: [number, any]) => ({
          color,
          name,
          userId,
        }),
      ),
    );
  }, [yjsProvider]);

  const handleConnectionToggle = () => {
    if (yjsProvider == null) {
      return;
    }
    if (connected) {
      yjsProvider.disconnect();
    } else {
      yjsProvider.connect();
    }
  };

  useEffect(() => {
    if (yjsProvider == null) {
      return;
    }

    yjsProvider.awareness.on('update', handleAwarenessUpdate);

    return () => yjsProvider.awareness.off('update', handleAwarenessUpdate);
  }, [yjsProvider, handleAwarenessUpdate]);

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const provider = createWebsocketProvider(id, yjsDocMap);
      provider.on('status', (event: any) => {
        setConnected(event.status === 'connected');
      });

      // This is a hack to get reference to provider with standard CollaborationPlugin.
      // To be fixed in future versions of Lexical.
      setTimeout(() => setYjsProvider(provider), 0);

      return provider;
    },
    [],
  );

  return (
    <div ref={containerRef}>
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Collaborative Editor</h3>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <strong>Connection:</strong>
            <span style={{ color: connected ? '#4CAF50' : '#F44336', marginLeft: '8px' }}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            <button
              onClick={handleConnectionToggle}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                backgroundColor: connected ? '#F44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          <div>
            <strong>My Name:</strong>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) =>
                setUserProfile((profile) => ({...profile, name: e.target.value}))
              }
              style={{ marginLeft: '8px', padding: '4px' }}
            />
            <input
              type="color"
              value={userProfile.color}
              onChange={(e) =>
                setUserProfile((profile) => ({...profile, color: e.target.value}))
              }
              style={{ marginLeft: '8px' }}
            />
          </div>

          <div>
            <strong>Active users:</strong>
            <span style={{ marginLeft: '8px' }}>
              {activeUsers.map(({name, color, userId}, idx) => (
                <Fragment key={userId}>
                  <span style={{color}}>{name}</span>
                  {idx === activeUsers.length - 1 ? '' : ', '}
                </Fragment>
              ))}
            </span>
          </div>
        </div>
      </div>

      <LexicalCollaboration>
        <LexicalComposer initialConfig={editorConfig}>
          {/* With CollaborationPlugin - we MUST NOT use @lexical/react/LexicalHistoryPlugin */}
          <CollaborationPlugin
            id="lexical/react-rich-collab"
            providerFactory={providerFactory}
            // Unless you have a way to avoid race condition between 2+ users trying to do bootstrap simultaneously
            // you should never try to bootstrap on client. It's better to perform bootstrap within Yjs server.
            shouldBootstrap={false}
            username={userProfile.name}
            cursorColor={userProfile.color}
            cursorsContainerRef={containerRef}
          />
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
              <AutoFocusPlugin />
              <ListPlugin />
              <CheckListPlugin />
              {/* <TreeViewPlugin /> */}
            </div>
          </div>
        </LexicalComposer>
      </LexicalCollaboration>
    </div>
  );
}
