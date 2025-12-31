import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native";
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
  checklistDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    marginLeft: 24,
  },
  checklistSpacer: {
    height: 12,
  },
  checklistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 24,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checklistCardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  checklistCardContent: {
    padding: 12,
  },
  checklistCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  checklistCardBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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

// 체크리스트 카드 컴포넌트
interface ChecklistCardProps {
  imageUrl?: string;
  title: string;
  body: string;
}

const ChecklistCard: React.FC<ChecklistCardProps> = ({ 
  imageUrl = 'https://via.placeholder.com/400x150/4A90E2/FFFFFF?text=Sample+Image',
  title,
  body 
}) => {
  return (
    <View style={styles.checklistCard}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.checklistCardImage}
      />
      <View style={styles.checklistCardContent}>
        <Text style={styles.checklistCardTitle}>{title}</Text>
        <Text style={styles.checklistCardBody}>{body}</Text>
      </View>
    </View>
  );
};

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

                // 체크리스트 항목 사이에 커스텀 컴포넌트 삽입 예제
                // 첫 번째와 두 번째 항목 사이에 구분선 추가
                if (itemIndex === 0) {
                  elements.push(
                    <View key={`${index}-${itemIndex}-divider`} style={styles.checklistDivider} />
                  );
                }
                // 두 번째 항목 뒤에 카드 컴포넌트 추가 예제
                if (itemIndex === 1) {
                  elements.push(
                    <ChecklistCard
                      key={`${index}-${itemIndex}-card`}
                      title="중요 항목"
                      body="이 항목은 중요한 정보를 포함하고 있습니다. 자세한 내용을 확인하시기 바랍니다."
                    />
                  );
                }
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

// Tree 뷰 렌더링 함수
const renderTreeNode = (node: any, depth: number = 0): React.ReactNode => {
  const indent = depth * 20;
  const nodeType = node.type || 'unknown';
  const nodeKey = node.key || node.id || Math.random();
  
  let nodeLabel = nodeType;
  if (node.tag) nodeLabel += ` (${node.tag})`;
  if (node.text) nodeLabel += ` "${node.text.substring(0, 20)}${node.text.length > 20 ? '...' : ''}"`;
  if (node.checked !== undefined) nodeLabel += ` [checked: ${node.checked}]`;
  if (node.listType) nodeLabel += ` [listType: ${node.listType}]`;

  return (
    <View key={nodeKey} style={{ marginLeft: indent, marginVertical: 2 }}>
      <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#fff' }}>
        {nodeLabel}
      </Text>
      {node.children && node.children.map((child: any, index: number) => 
        renderTreeNode(child, depth + 1)
      )}
    </View>
  );
};

const renderTreeView = (editorStateJson: string | null): React.ReactNode => {
  if (!editorStateJson) return <Text style={{ fontSize: 12 }}>No content</Text>;

  try {
    const editorState = JSON.parse(editorStateJson);
    if (editorState.root) {
      return (
        <View style={{ backgroundColor: '#222', padding: 8, borderRadius: 4 }}>
          <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>
            Tree View
          </Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {renderTreeNode(editorState.root)}
          </ScrollView>
        </View>
      );
    }
    return <Text style={{ fontSize: 12 }}>No root node</Text>;
  } catch (error) {
    return <Text style={{ fontSize: 12 }}>Error parsing tree</Text>;
  }
};

// DOM Export 함수
const exportDOM = (editorStateJson: string | null): string => {
  if (!editorStateJson) return 'No content';

  try {
    const editorState = JSON.parse(editorStateJson);
    const html: string[] = [];

    const nodeToHTML = (node: any): string => {
      if (node.type === 'text') {
        let style = '';
        if (node.format & 1) style += 'font-weight: bold; ';
        if (node.format & 2) style += 'font-style: italic; ';
        if (node.format & 4) style += 'text-decoration: underline; ';
        if (node.format & 8) style += 'text-decoration: line-through; ';
        
        if (style) {
          return `<span style="${style.trim()}">${node.text || ''}</span>`;
        }
        return node.text || '';
      }

      if (node.type === 'heading') {
        const tag = node.tag || 'h1';
        const content = node.children ? node.children.map(nodeToHTML).join('') : '';
        return `<${tag} class="editor-heading-${tag}">${content}</${tag}>`;
      }

      if (node.type === 'paragraph') {
        const content = node.children ? node.children.map(nodeToHTML).join('') : '';
        return `<p class="editor-paragraph">${content}</p>`;
      }

      if (node.type === 'quote') {
        const content = node.children ? node.children.map(nodeToHTML).join('') : '';
        return `<blockquote class="editor-quote">${content}</blockquote>`;
      }

      if (node.type === 'code') {
        const content = node.children ? node.children.map((c: any) => c.text || '').join('') : '';
        return `<pre class="editor-code">${content}</pre>`;
      }

      if (node.type === 'link') {
        const content = node.children ? node.children.map(nodeToHTML).join('') : '';
        return `<a href="${node.url || '#'}" class="editor-link">${content}</a>`;
      }

      if (node.type === 'list') {
        const tag = node.listType === 'number' ? 'ol' : 'ul';
        const listClass = node.listType === 'check' ? 'editor-checklist' : `editor-list-${tag}`;
        const items = node.children ? node.children.map((item: any) => {
          const content = item.children ? item.children.map(nodeToHTML).join('') : '';
          const role = node.listType === 'check' ? `role="checkbox" aria-checked="${item.checked ? 'true' : 'false'}"` : '';
          return `<li class="editor-listitem" ${role}>${content}</li>`;
        }).join('') : '';
        return `<${tag} class="${listClass}">${items}</${tag}>`;
      }

      if (node.children) {
        return node.children.map(nodeToHTML).join('');
      }

      return '';
    };

    if (editorState.root && editorState.root.children) {
      const content = editorState.root.children.map(nodeToHTML).join('');
      return `<div>${content}</div>`;
    }

    return 'No content';
  } catch (error) {
    return `Error: ${error}`;
  }
};

const Editor = lazy(() => import("@/components/dom-components/hello-dom"));

export default function TabTwoScreen() {
  const [editorState, setEditorState] = useState<string | null>(null);
  const [plainText, setPlainText] = useState("");
  const [activeTab, setActiveTab] = useState<'render' | 'tree' | 'dom'>('render');
  const [domExport, setDomExport] = useState<string>('');
  const wordCount = editorState?.split(" ").length ?? 0;

  React.useEffect(() => {
    if (editorState) {
      setDomExport(exportDOM(editorState));
    }
  }, [editorState]);

  const isWeb = Platform.OS === 'web';

  return (
    <>
      <View style={{ flexDirection: isWeb ? 'row' : 'column', flex: 1 }}>
        {/* 왼쪽: Render Side */}
        <ScrollView style={{ flex: isWeb ? 1 : undefined }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>📱 Render Side</Text>
            
            {/* 탭 버튼 */}
            <View style={{ flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
              <TouchableOpacity
                onPress={() => setActiveTab('render')}
                style={{
                  padding: 8,
                  borderBottomWidth: activeTab === 'render' ? 2 : 0,
                  borderBottomColor: activeTab === 'render' ? '#007AFF' : 'transparent',
                  marginRight: 16,
                }}
              >
                <Text style={{ color: activeTab === 'render' ? '#007AFF' : '#666', fontWeight: activeTab === 'render' ? 'bold' : 'normal' }}>
                  Render
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('tree')}
                style={{
                  padding: 8,
                  borderBottomWidth: activeTab === 'tree' ? 2 : 0,
                  borderBottomColor: activeTab === 'tree' ? '#007AFF' : 'transparent',
                  marginRight: 16,
                }}
              >
                <Text style={{ color: activeTab === 'tree' ? '#007AFF' : '#666', fontWeight: activeTab === 'tree' ? 'bold' : 'normal' }}>
                  Tree
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('dom')}
                style={{
                  padding: 8,
                  borderBottomWidth: activeTab === 'dom' ? 2 : 0,
                  borderBottomColor: activeTab === 'dom' ? '#007AFF' : 'transparent',
                }}
              >
                <Text style={{ color: activeTab === 'dom' ? '#007AFF' : '#666', fontWeight: activeTab === 'dom' ? 'bold' : 'normal' }}>
                  DOM
                </Text>
              </TouchableOpacity>
            </View>

            {/* 탭 컨텐츠 */}
            {activeTab === 'render' && (
              <View style={{ marginVertical: 10 }}>
                {renderRichText(editorState)}
                <Text style={{ fontSize: 16, marginTop: 16 }}>Words: {wordCount}</Text>
              </View>
            )}

            {activeTab === 'tree' && (
              <View style={{ marginVertical: 10 }}>
                {renderTreeView(editorState)}
              </View>
            )}

            {activeTab === 'dom' && (
              <View style={{ marginVertical: 10 }}>
                <View style={{ backgroundColor: '#222', padding: 8, borderRadius: 4 }}>
                  <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>
                    Export DOM
                  </Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'monospace' }}>
                      {domExport || 'No content'}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 오른쪽: Editor (웹일 때만 나란히 배치) */}
        {isWeb && (
          <View style={{ flex: 1 }}>
            <Suspense fallback={<View><Text>Loading editor...</Text></View>}>
              <Editor setPlainText={setPlainText} setEditorState={setEditorState} />
            </Suspense>
          </View>
        )}
      </View>
      {/* 모바일: Editor는 아래에 배치 */}
      {!isWeb && (
        <Suspense fallback={<View><Text>Loading editor...</Text></View>}>
          <Editor setPlainText={setPlainText} setEditorState={setEditorState} />
        </Suspense>
      )}
    </>
  );
}