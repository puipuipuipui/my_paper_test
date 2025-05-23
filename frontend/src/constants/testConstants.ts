import { TestPhase } from '../types/testTypes';

// 測試詞彙定義
export const maleWords = ['男孩', '叔叔', '丈夫', '爸爸', '爺爺'];
export const femaleWords = ['女孩', '阿姨', '妻子', '母親', '奶奶'];
export const computerWords = ['機械鍵盤', '電競滑鼠', '曲面螢幕', '顯示卡', '水冷散熱器'];
export const skinCareWords = ['面膜', '精華液', '保濕霜', '眼霜', '乳液'];

// 測試階段定義
export const TEST_PHASES: Record<string, TestPhase> = {
  START: 'start',
  INTRO: 'intro',
  GENDER_PRACTICE: 'gender_practice',
  PRODUCT_PRACTICE: 'product_practice',
  COMBINED_TEST_1: 'combined_test_1',
  REVERSED_PRACTICE: 'reversed_practice',
  COMBINED_TEST_2: 'combined_test_2',
  RESULTS: 'results',
  VIDEO: 'video',
  SURVEY: 'survey',
  COMPLETED: 'completed'
};

// 進度條配置
export const phaseProgress: Record<TestPhase, number> = {
  start: 0,
  intro: 10,
  gender_practice: 20,
  product_practice: 30,
  combined_test_1: 40,
  reversed_practice: 60,
  combined_test_2: 80,
  results: 90,
  video: 95,
  survey: 100,
  completed: 100
};

// 階段指引標題和內容
export const phaseInstructions: Record<TestPhase, { title: string; content: string }> = {
  start: { title: '', content: '' },
  intro: { title: '', content: '' },
  gender_practice: {
    title: '性別分類練習',
    // 使用<br />而不是\n，或使用CSS處理白空間
    content: `在這個階段，您需要對出現的詞語進行性別分類。
              請使用鍵盤按鍵：
              - 按 E 鍵：男性詞語（如：爸爸、男孩）
              - 按 I 鍵： 女性詞語（如：女孩、奶奶）
              請盡可能快速且準確地做出反應。`
              },
  product_practice: {
    title: '產品分類練習',
    content: `在這個階段，您需要對出現的詞語進行產品類別分類。
            請使用鍵盤按鍵：
            - 按 E 鍵：電腦類產品（如：電競滑鼠、顯示卡）
            - 按 I 鍵： 護膚類產品（如：眼霜、乳液）
            請盡可能快速且準確地做出反應。`
            },
  combined_test_1: {
    title: '聯合分類測試（第一階段）',
    content: `在這個階段，您需要同時對"性別詞語"和"產品詞語"進行分類。
            請使用鍵盤按鍵：
            - 按 E 鍵：男性詞語 或 電腦類產品
            - 按 I 鍵： 女性詞語 或 護膚類產品
            請盡可能快速且準確地做出反應。`
              },
  reversed_practice: {
    title: '反向性別分類練習',
    content: `注意！分類方向已經改變。
            請使用鍵盤按鍵：
            - 按 E 鍵：女性詞語（如：女孩、奶奶）
            - 按 I 鍵： 男性詞語（如：爸爸、男孩）
            請盡可能快速且準確地做出反應。`
              },
  combined_test_2: {
    title: '聯合分類測試（第二階段）',
    content: `在這個階段，您需要同時對"性別詞語"和"產品詞語"進行分類，但配對方式已改變。
            請使用鍵盤按鍵：
            - 按 E 鍵：女性詞語 或 電腦類產品
            - 按 I 鍵： 男性詞語 或 護膚類產品
            請盡可能快速且準確地做出反應。`
              },
  results: { title: '', content: '' },
  video: { title: '', content: '' },
  survey: { title: '', content: '' },
  completed: { title: '', content: '' }
};