import { useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import * as Y from 'yjs';
import type { Provider } from '@lexical/yjs';
import { createWebRTCProvider } from '@/components/collaboration/providers';

const CollaborationEditor = lazy(() => import('@/components/collaboration/CollaborationEditor'));

const colors = [
  '#7d0000', '#640000', '#990000', '#bf0000', '#bf4000',
  '#004000', '#007f00', '#407f00', '#7f7f00', '#000099',
  '#0000bf', '#0000ff', '#004040', '#404040', '#7f0040', '#bf0040'
];

function getRandomUserProfile() {
  const names = [
    'User 1', 'User 2', 'User 3', 'User 4', 'User 5',
    'Editor A', 'Editor B', 'Writer 1', 'Writer 2'
  ];
  return {
    name: names[Math.floor(Math.random() * names.length)],
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

export default function TabTwoScreen() {
  const [userProfile1, setUserProfile1] = useState(() => getRandomUserProfile());
  const [userProfile2, setUserProfile2] = useState(() => getRandomUserProfile());
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  
  // 두 에디터가 같은 yjsDocMap을 공유해야 동기화가 됩니다
  const sharedYjsDocMap = useMemo(() => new Map<string, Y.Doc>(), []);
  
  // 공유할 editorId
  const sharedEditorId = "collaboration-editor-shared";
  
  // 공유 Provider를 위한 상태
  const [sharedProvider, setSharedProvider] = useState<Provider | null>(null);
  
  // 공유 Provider Factory - 같은 editorId에 대해 같은 Provider를 반환
  // createWebRTCProvider가 내부적으로 캐싱을 처리하므로 같은 id와 yjsDocMap에 대해 같은 Provider를 반환합니다
  const sharedProviderFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      // createWebRTCProvider가 캐싱을 처리하므로 같은 id와 yjsDocMap에 대해 같은 Provider를 반환
      const provider = createWebRTCProvider(id, yjsDocMap);
      
      // Provider 참조 저장 (디버깅용)
      setTimeout(() => setSharedProvider(provider), 0);
      
      // 상태 관리는 CollaborationEditor의 providerFactory에서 처리하므로 여기서는 하지 않음
      return provider;
    },
    [],
  );
  
  return (
    <div style={styles.webContainer}>
      <div style={styles.header}>
        <h2 style={styles.title}>실시간 협업 에디터 (Yjs CRDT)</h2>
        <div style={styles.info}>
          <p>
            두 에디터가 동일한 문서 ID를 공유하므로 양쪽에서 입력하면 실시간으로 동기화됩니다.
            다른 브라우저 창에서도 같은 URL을 열면 함께 편집할 수 있습니다.
          </p>
        </div>
      </div>
      
      <div style={styles.controlsContainer}>
        <div style={styles.userControl}>
          <label>왼쪽 에디터 사용자:</label>
          <input
            type="text"
            value={userProfile1.name}
            onChange={(e) => setUserProfile1({ ...userProfile1, name: e.target.value })}
            style={styles.input}
          />
          <input
            type="color"
            value={userProfile1.color}
            onChange={(e) => setUserProfile1({ ...userProfile1, color: e.target.value })}
            style={styles.colorInput}
          />
        </div>
        <div style={styles.userControl}>
          <label>오른쪽 에디터 사용자:</label>
          <input
            type="text"
            value={userProfile2.name}
            onChange={(e) => setUserProfile2({ ...userProfile2, name: e.target.value })}
            style={styles.input}
          />
          <input
            type="color"
            value={userProfile2.color}
            onChange={(e) => setUserProfile2({ ...userProfile2, color: e.target.value })}
            style={styles.colorInput}
          />
        </div>
      </div>

      <Suspense fallback={<div style={styles.loading}>Loading editor...</div>}>
        <div style={styles.editorsContainer}>
          <div style={styles.editorWrapper}>
            <CollaborationEditor
              editorId={sharedEditorId}
              userProfile={userProfile1}
              containerRef={containerRef1}
              yjsDocMap={sharedYjsDocMap}
              providerFactory={sharedProviderFactory}
              instanceId="editor-1"
            />
          </div>
          
          <div style={styles.divider}></div>
          
          <div style={styles.editorWrapper}>
            <CollaborationEditor
              editorId={sharedEditorId}
              userProfile={userProfile2}
              containerRef={containerRef2}
              yjsDocMap={sharedYjsDocMap}
              providerFactory={sharedProviderFactory}
              instanceId="editor-2"
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

const styles = {
  webContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 'bold' as const,
  },
  info: {
    fontSize: '14px',
    color: '#666',
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #ddd',
  },
  userControl: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    padding: '4px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  colorInput: {
    width: '40px',
    height: '30px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer' as const,
  },
  editorsContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    flex: 1,
    overflow: 'hidden',
  },
  editorWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    borderRight: '1px solid #ddd',
  },
  divider: {
    width: '4px',
    backgroundColor: '#ddd',
    cursor: 'col-resize' as const,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: '16px',
  },
};
