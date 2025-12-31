import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { Text, View } from "react-native";
import { lazy, Suspense } from "react";

// Rich text를 React Native 컴포넌트로 변환하는 간단한 함수
const renderRichText = (editorStateJson: string | null): React.ReactNode => {
  if (!editorStateJson) return <Text>No content</Text>;

  try {
    const editorState = JSON.parse(editorStateJson);
    const elements: React.ReactNode[] = [];

    // 간단하게 root의 children을 순회하면서 텍스트만 추출
    if (editorState.root?.children) {
      editorState.root.children.forEach((node: any, index: number) => {
        if (node.type === 'heading' && node.children) {
          const text = node.children.map((child: any) => child.text || '').join('');
          const fontSize = node.tag === 'h1' ? 24 : node.tag === 'h2' ? 20 : 18;
          const fontWeight = node.tag === 'h1' ? 'bold' : '600';
          elements.push(
            <Text key={index} style={{ fontSize, fontWeight, marginVertical: 8 }}>
              {text}
            </Text>
          );
        } else if (node.type === 'paragraph' && node.children) {
          const text = node.children.map((child: any) => child.text || '').join('');
          elements.push(
            <Text key={index} style={{ fontSize: 16, marginVertical: 4 }}>
              {text}
            </Text>
          );
        } else if (node.type === 'quote' && node.children) {
          const text = node.children.map((child: any) => child.text || '').join('');
          elements.push(
            <Text key={index} style={{
              fontSize: 16,
              fontStyle: 'italic',
              paddingLeft: 16,
              borderLeftWidth: 3,
              borderLeftColor: '#ccc',
              marginVertical: 8
            }}>
              {text}
            </Text>
          );
        } else if (node.type === 'code' && node.children) {
          const text = node.children.map((child: any) => child.text || '').join('');
          elements.push(
            <Text key={index} style={{
              fontSize: 14,
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              padding: 8,
              marginVertical: 4
            }}>
              {text}
            </Text>
          );
        } else if (node.type === 'list' && node.children) {
          node.children.forEach((listItem: any, itemIndex: number) => {
            if (listItem.children) {
              const text = listItem.children.map((child: any) => child.text || '').join('');
              const bullet = node.listType === 'check' ? (listItem.checked ? '☑' : '☐') : '•';
              elements.push(
                <Text key={`${index}-${itemIndex}`} style={{ fontSize: 16, marginVertical: 2, marginLeft: 16 }}>
                  {bullet} {text}
                </Text>
              );
            }
          });
        }
      });
    }

    return <View>{elements}</View>;
  } catch (error) {
    return <Text>Error parsing content</Text>;
  }
};

const Editor = lazy(() => import("@/components/dom-components/hello-dom"));

export default function TabTwoScreen() {
  const [editorState, setEditorState] = useState<string | null>(null);
  const [plainText, setPlainText] = useState("");
  const wordCount = editorState?.split(" ").length ?? 0;

  // console.log(JSON.stringify(JSON.parse(editorState ?? ""), null, 2));

  return (
    <>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>📱 Native Side</Text>
        <View style={{ marginVertical: 10 }}>
          {renderRichText(editorState)}
        </View>
        <Text style={{ fontSize: 16 }}>Words: {wordCount}</Text>
      </View>
      <Suspense fallback={<View><Text>Loading editor...</Text></View>}>
        <Editor setPlainText={setPlainText} setEditorState={setEditorState} />
      </Suspense>
    </>
  );
}
