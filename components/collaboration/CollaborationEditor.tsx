"use dom";
import "../dom-components/styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { CollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import type { Provider } from "@lexical/yjs";
import { useCallback, useEffect, useRef, useState, Fragment, useMemo } from "react";
import * as Y from "yjs";

import ExampleTheme from "../dom-components/ExampleTheme";
import ToolbarPlugin from "../dom-components/plugins/ToolbarPlugin";
import { createWebRTCProvider } from "./providers";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

const placeholder = "Enter some rich text...";

interface UserProfile {
  name: string;
  color: string;
}

interface CollaborationEditorProps {
  editorId: string;
  userProfile: UserProfile;
  containerRef?: React.RefObject<HTMLDivElement>;
  yjsDocMap?: Map<string, Y.Doc>;
  providerFactory?: (id: string, yjsDocMap: Map<string, Y.Doc>) => Provider;
  instanceId?: string; // 각 에디터 인스턴스를 구분하기 위한 고유 ID
}

// editorConfig는 컴포넌트 내부에서 생성하여 각 에디터마다 고유한 설정을 가질 수 있도록 함
const createEditorConfig = () => ({
  // NOTE: This is critical for collaboration plugin to set editor state to null.
  // It would indicate that the editor should not try to set any default state
  // (not even empty one), and let collaboration plugin do it instead
  editorState: null,
  namespace: "Collaboration Editor",
  // 기본 노드들은 자동으로 포함되며, 리스트 노드만 추가
  nodes: [ListNode, ListItemNode],
  // Handling of errors during update
  onError(error: Error) {
    console.error("Lexical editor error:", error);
    // 에러를 throw하지 않고 로그만 남김
  },
  // The editor theme
  theme: ExampleTheme,
});

export default function CollaborationEditor({
  editorId,
  userProfile,
  containerRef,
  yjsDocMap: externalYjsDocMap,
  providerFactory: externalProviderFactory,
  instanceId = `editor-${Math.random().toString(36).substr(2, 9)}`,
}: CollaborationEditorProps) {
  const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<
    Array<{ userId: number; name: string; color: string }>
  >([]);

  const handleAwarenessUpdate = useCallback(() => {
    if (!yjsProvider) return;
    const awareness = (yjsProvider as any).awareness;
    if (!awareness) return;
    setActiveUsers(
      Array.from(awareness.getStates().entries()).map(
        ([userId, state]: [number, any]) => ({
          color: state.color || '#000000',
          name: state.name || 'Anonymous',
          userId,
        }),
      ),
    );
  }, [yjsProvider]);

  useEffect(() => {
    if (yjsProvider == null) {
      return;
    }

    const awareness = (yjsProvider as any).awareness;
    if (awareness) {
      awareness.on("update", handleAwarenessUpdate);
      return () => {
        awareness.off("update", handleAwarenessUpdate);
      };
    }
  }, [yjsProvider, handleAwarenessUpdate]);

  // 외부에서 전달된 yjsDocMap을 사용하거나, 없으면 새로 생성
  const yjsDocMap = useMemo(
    () => externalYjsDocMap || new Map<string, Y.Doc>(),
    [externalYjsDocMap]
  );

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      // 외부에서 전달된 providerFactory가 있으면 사용, 없으면 내부에서 생성
      // 같은 id와 yjsDocMap에 대해 같은 Provider를 반환하도록 보장
      const factory = externalProviderFactory || createWebRTCProvider;
      const provider = factory(id, yjsDocMap);
      
      // Provider의 상태 이벤트를 구독하여 연결 상태를 추적
      // 같은 Provider를 여러 에디터가 공유하더라도 각 에디터는 자신의 상태를 관리합니다
      provider.on("status", (event: any) => {
        setConnected(
          // Websocket provider
          event.status === "connected" ||
            // WebRTC provider has different approach to status reporting
            ("connected" in event && event.connected === true),
        );
      });

      // This is a hack to get reference to provider with standard CollaborationPlugin.
      // To be fixed in future versions of Lexical.
      // 같은 Provider 인스턴스가 여러 에디터에서 공유되더라도 각 에디터는 자신의 참조를 유지합니다
      setTimeout(() => setYjsProvider(provider), 0);

      return provider;
    },
    [externalProviderFactory],
  );

  const editorConfig = useMemo(() => createEditorConfig(), []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px", fontSize: "12px", backgroundColor: "#f5f5f5" }}>
        <div>
          <b>Editor ID:</b> {editorId}
        </div>
        <div>
          <b>Status:</b> {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
        <div>
          <b>Active users:</b>{" "}
          {activeUsers.map(({ name, color, userId }, idx) => (
            <Fragment key={userId}>
              <span style={{ color }}>{name}</span>
              {idx === activeUsers.length - 1 ? "" : ", "}
            </Fragment>
          ))}
        </div>
      </div>
      {/* CollaborationContext는 상위에서 제공되므로 여기서는 사용하지 않음 */}
      {/* 각 에디터 인스턴스마다 고유한 key를 사용하여 React가 별도의 컴포넌트로 인식하도록 함 */}
      {/* editorId는 협업 문서 ID이고, instanceId는 React 컴포넌트 인스턴스를 구분하기 위한 것입니다 */}
      <LexicalComposer initialConfig={editorConfig} key={instanceId}>
          {/* With CollaborationPlugin - we MUST NOT use @lexical/react/LexicalHistoryPlugin */}
          <CollaborationPlugin
            id={editorId}
            providerFactory={providerFactory}
            // Unless you have a way to avoid race condition between 2+ users trying to do bootstrap simultaneously
            // you should never try to bootstrap on client. It's better to perform bootstrap within Yjs server.
            // react-rich-collab 예제와 동일하게 false로 설정
            shouldBootstrap={false}
            username={userProfile.name}
            cursorColor={userProfile.color}
            cursorsContainerRef={containerRef}
          />
          <div className="editor-container" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <ToolbarPlugin />
            <div className="editor-inner" style={{ flex: 1 }}>
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
              <AutoFocusPlugin />
              <ListPlugin />
              <CheckListPlugin />
            </div>
          </div>
        </LexicalComposer>
    </div>
  );
}

