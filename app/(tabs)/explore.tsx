import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { lazy, Suspense } from "react";
import { editorStyles } from "@/components/dom-components/editorStyles";

// 웹 에디터의 CSS와 동일한 스타일 상수 사용
const styles = StyleSheet.create({
  headingH1: {
    fontSize: editorStyles.fontSize.h1,
    color: editorStyles.color.text,
    fontWeight: editorStyles.fontWeight.h1 as any,
    margin: 0,
    marginBottom: editorStyles.spacing.headingH1MarginBottom,
    padding: 0,
  },
  headingH2: {
    fontSize: editorStyles.fontSize.h2,
    color: editorStyles.color.textSecondary,
    fontWeight: editorStyles.fontWeight.h2 as any,
    margin: 0,
    marginTop: editorStyles.spacing.headingH2MarginTop,
    padding: 0,
    textTransform: editorStyles.h2TextTransform as any,
  },
  paragraph: {
    fontSize: editorStyles.fontSize.paragraph,
    marginVertical: 4,
  },
  quote: {
    fontSize: editorStyles.fontSize.quote,
    fontStyle: editorStyles.quoteFontStyle as any,
    color: editorStyles.color.textSecondary,
    paddingLeft: editorStyles.spacing.quotePaddingLeft,
    borderLeftWidth: editorStyles.spacing.quoteBorderWidth,
    borderLeftColor: editorStyles.color.quoteBorder,
    marginVertical: 8,
  },
  code: {
    fontSize: editorStyles.fontSize.code,
    fontFamily: 'monospace',
    backgroundColor: editorStyles.color.codeBackground,
    padding: editorStyles.spacing.codePadding,
    marginVertical: 8,
    lineHeight: editorStyles.codeLineHeight,
  },
  listItem: {
    fontSize: editorStyles.fontSize.listItem,
    marginVertical: 8,
    marginLeft: editorStyles.spacing.listItemMarginLeft,
  },
  bulletListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingLeft: 0,
  },
  bulletPoint: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#333',
    marginRight: 8,
    marginTop: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingLeft: 0,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#333',
  },
  checkboxCheckmark: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  textBold: {
    fontWeight: editorStyles.fontWeight.bold as any,
  },
  textItalic: {
    fontStyle: 'italic',
  },
  textUnderline: {
    textDecorationLine: 'underline',
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  textUnderlineStrikethrough: {
    textDecorationLine: 'underline line-through',
  },
  link: {
    color: editorStyles.color.link,
    textDecorationLine: 'underline',
  },
});

// 텍스트 노드의 스타일을 적용하는 헬퍼 함수
const renderTextNode = (node: any): React.ReactNode => {
  if (node.type === 'text') {
    let textStyles: any[] = [];

    // format에 따른 스타일 적용
    if (node.format & 1) textStyles.push(styles.textBold); // BOLD
    if (node.format & 2) textStyles.push(styles.textItalic); // ITALIC
    if (node.format & 4) textStyles.push(styles.textUnderline); // UNDERLINE
    if (node.format & 8) textStyles.push(styles.textStrikethrough); // STRIKETHROUGH

    return (
      <Text key={node.id || Math.random()} style={textStyles}>
        {node.text}
      </Text>
    );
  } else if (node.type === 'link') {
    return (
      <Text key={node.id || Math.random()} style={styles.link}>
        {node.children ? node.children.map(renderTextNode) : node.text}
      </Text>
    );
  }

  return node.text || '';
};

// 노드의 children을 렌더링하는 헬퍼 함수
const renderNodeChildren = (children: any[]): React.ReactNode[] => {
  if (!children) return [];

  return children.map((child, idx) => (
    <React.Fragment key={child.id || idx}>
      {renderTextNode(child)}
    </React.Fragment>
  ));
};

// Rich text를 React Native 컴포넌트로 변환하는 함수
const renderRichText = (editorStateJson: string | null): React.ReactNode => {
  if (!editorStateJson) return <Text>No content</Text>;

  try {
    const editorState = JSON.parse(editorStateJson);
    const elements: React.ReactNode[] = [];

    if (editorState.root?.children) {
      editorState.root.children.forEach((node: any, index: number) => {
        if (node.type === 'heading' && node.children) {
          const headingStyle = node.tag === 'h1' ? styles.headingH1 : styles.headingH2;
          elements.push(
            <Text key={index} style={headingStyle}>
              {renderNodeChildren(node.children)}
            </Text>
          );
        } else if (node.type === 'paragraph' && node.children) {
          elements.push(
            <Text key={index} style={styles.paragraph}>
              {renderNodeChildren(node.children)}
            </Text>
          );
        } else if (node.type === 'quote' && node.children) {
          elements.push(
            <Text key={index} style={styles.quote}>
              {renderNodeChildren(node.children)}
            </Text>
          );
        } else if (node.type === 'code' && node.children) {
          const text = node.children.map((child: any) => child.text || '').join('');
          elements.push(
            <Text key={index} style={styles.code}>
              {text}
            </Text>
          );
        } else if (node.type === 'list' && node.children) {
          node.children.forEach((listItem: any, itemIndex: number) => {
            if (listItem.children) {
              if (node.listType === 'check') {
                // 체크리스트: 웹과 동일한 체크박스 UI 사용
                elements.push(
                  <View key={`${index}-${itemIndex}`} style={styles.checklistItem}>
                    <View style={[styles.checkbox, listItem.checked && styles.checkboxChecked]}>
                      {listItem.checked && (
                        <Text style={styles.checkboxCheckmark}>✓</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: editorStyles.fontSize.listItem }}>
                        {renderNodeChildren(listItem.children)}
                      </Text>
                    </View>
                  </View>
                );
              } else {
                // 일반 리스트: 웹과 동일한 불릿 포인트 UI 사용
                elements.push(
                  <View key={`${index}-${itemIndex}`} style={styles.bulletListItem}>
                    <View style={styles.bulletPoint} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: editorStyles.fontSize.listItem }}>
                        {renderNodeChildren(listItem.children)}
                      </Text>
                    </View>
                  </View>
                );
              }
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
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>📱 Render Side</Text>
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