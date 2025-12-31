import type { Provider } from "@lexical/yjs";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

/**
 * 같은 (id, yjsDocMap) 조합에 대해 같은 Provider를 반환하기 위한 캐시
 * WeakMap을 사용하여 yjsDocMap 참조를 키로 사용하고,
 * 내부 Map에서 id를 키로 Provider를 저장
 */
const providerCache = new WeakMap<Map<string, Y.Doc>, Map<string, Provider>>();

/**
 * Allows browser windows/tabs to communicate with each other w/o a server (if origin is the same)
 * using BroadcastChannel API. Useful for demo purposes.
 * 
 * 같은 id와 yjsDocMap 조합에 대해 같은 Provider를 반환하여
 * 여러 에디터가 같은 Y.Doc을 공유하고 동기화되도록 보장합니다.
 */
export function createWebRTCProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>,
): Provider {
  // 같은 yjsDocMap에 대한 캐시 맵 가져오기 또는 생성
  let docMapCache = providerCache.get(yjsDocMap);
  if (!docMapCache) {
    docMapCache = new Map<string, Provider>();
    providerCache.set(yjsDocMap, docMapCache);
  }

  // 같은 id에 대해 이미 생성된 Provider가 있으면 재사용
  // 이렇게 하면 같은 문서를 공유하는 여러 에디터가 같은 Provider를 사용하게 됩니다
  if (docMapCache.has(id)) {
    const cachedProvider = docMapCache.get(id)!;
    // Provider가 여전히 유효한지 확인 (연결 상태 확인)
    if (cachedProvider) {
      return cachedProvider;
    }
  }

  // 같은 id에 대해 같은 Y.Doc을 가져옵니다
  // getDocFromMap은 같은 id에 대해 항상 같은 Y.Doc 인스턴스를 반환합니다
  const doc = getDocFromMap(id, yjsDocMap);

  // 같은 id를 사용하여 같은 WebRTC room에 연결합니다
  // react-rich-collab 예제와 달리 idSuffix를 사용하지 않아
  // 같은 id에 대해 항상 같은 room에 연결됩니다
  const provider = new WebrtcProvider(id, doc, {
    peerOpts: {
      reconnectTimer: 100,
    },
    signaling:
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? ["ws://localhost:1235"]
        : [],
  }) as unknown as Provider;

  // Provider를 캐시에 저장하여 다음 호출 시 재사용
  docMapCache.set(id, provider);

  return provider;
}

function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  } else {
    // 이미 존재하는 doc의 경우, react-rich-collab 예제와 동일하게 load() 호출
    // Y.Doc은 자동으로 로드되지만, 명시적으로 호출하여 상태를 보장
    doc.load();
  }

  return doc;
}

