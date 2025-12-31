/**
 * 공통 에디터 스타일 상수
 * 웹 CSS와 네이티브 StyleSheet에서 공유
 */

export const editorStyles = {
  // 폰트 사이즈
  fontSize: {
    input: 15,
    h1: 24,
    h2: 15,
    paragraph: 15,
    quote: 15,
    code: 13,
    listItem: 15,
  },

  // 색상
  color: {
    text: 'rgb(5, 5, 5)',
    textSecondary: 'rgb(101, 103, 107)',
    link: 'rgb(33, 111, 219)',
    placeholder: '#999',
    codeBackground: 'rgb(240, 242, 245)',
    quoteBorder: 'rgb(206, 208, 212)',
  },

  // 폰트 굵기
  fontWeight: {
    h1: '400',
    h2: '700',
    bold: 'bold',
  },

  // 간격
  spacing: {
    paragraphMarginBottom: 8,
    headingH1MarginBottom: 12,
    headingH2MarginTop: 10,
    quotePaddingLeft: 16,
    quoteBorderWidth: 4,
    listItemMarginLeft: 16,
    codePadding: 8,
  },

  // 기타
  codeLineHeight: 20,
  quoteFontStyle: 'italic',
  h2TextTransform: 'uppercase',
};

