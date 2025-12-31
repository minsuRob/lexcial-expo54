"use dom";

import { lazy, Suspense } from "react";

const CollaborativeEditor = lazy(() => import("@/components/dom-components/collaborative-editor"));

export default function TabTwoScreen() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px',
        fontSize: '2.5rem'
      }}>
        React.js Collaborative Lexical Example
      </h1>

      <div style={{
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#495057' }}>
          Real-time Collaborative Rich Text Editor
        </h2>
        <p style={{ margin: '0', color: '#6c757d' }}>
          This example demonstrates Lexical's collaborative editing capabilities using Yjs and WebSocket.
          Multiple users can edit the same document simultaneously with real-time synchronization.
        </p>
      </div>

      <Suspense fallback={
        <div style={{
          textAlign: 'center',
          padding: '40px',
          fontSize: '18px',
          color: '#6c757d'
        }}>
          Loading collaborative editor...
        </div>
      }>
        <CollaborativeEditor />
      </Suspense>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#004085'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#004085' }}>How to use:</h3>
        <ol style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Make sure the WebSocket server is running: <code>npm run server:ws</code></li>
          <li>Click "Connect" to join the collaborative session</li>
          <li>Set your name and color for identification</li>
          <li>Start editing - changes will sync in real-time across all connected clients</li>
          <li>Open multiple browser tabs/windows to test collaboration</li>
        </ol>
      </div>
    </div>
  );
}
