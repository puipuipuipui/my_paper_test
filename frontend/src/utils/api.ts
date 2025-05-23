// frontend/src/utils/api.ts
import { TestResults } from '../types/testTypes';

// 最簡單的解決方案：直接判斷當前域名
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocalhost 
  ? 'http://localhost:5000/api'  // 開發環境
  : '/api';  // 生產環境使用相對路徑

// 定義測試結果資料介面
interface TestResultData {
  testResults: TestResults;
  dScore: number;
  biasType: string | null;
  biasLevel: string;
  biasDirection?: string;
  d1Score?: number;
  d2Score?: number;
  d3Score?: number;
  d4Score?: number;
  surveyResponses?: Record<string, any>;
}

/**
 * 儲存測試結果到後端
 * @param data 測試結果資料
 * @returns Promise<any>
 */
export async function saveTestResults(data: TestResultData): Promise<any> {
  try {
    // 產生或獲取用戶 ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    
    // 收集裝置資訊
    const deviceInfo = {
      browser: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform
    };
    
    // 準備要發送的資料
    const payload = {
      userId,
      testDate: new Date().toISOString(),
      results: {
        maleComputer: data.testResults.maleComputer,
        femaleSkincare: data.testResults.femaleSkincare,
        femaleComputer: data.testResults.femaleComputer,
        maleSkincare: data.testResults.maleSkincare
      },
      analysis: {
        dScore: data.dScore,
        biasType: data.biasType,
        biasLevel: data.biasLevel,
        biasDirection: data.biasDirection,
        d1Score: data.d1Score,
        d2Score: data.d2Score,
        d3Score: data.d3Score,
        d4Score: data.d4Score
      },
      surveyResponses: data.surveyResponses || {},
      deviceInfo
    };
    
    console.log('🚀 正在儲存測試結果...', { userId, apiUrl: `${API_BASE_URL}/test-results` });
    
    const response = await fetch(`${API_BASE_URL}/test-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 回應錯誤:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`伺服器錯誤 (${response.status}): ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ 測試結果儲存成功:', result);
    return result;
    
  } catch (error) {
    console.error('❌ 儲存測試結果失敗:', error);
    
    // 根據錯誤類型提供更詳細的錯誤訊息
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到伺服器，請檢查網路連接或稍後再試');
    } else if (error instanceof Error) {
      throw new Error(`儲存失敗: ${error.message}`);
    } else {
      throw new Error('未知錯誤，請稍後再試');
    }
  }
}

/**
 * 檢查 API 連接狀態
 * @returns Promise<boolean>
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API 健康檢查通過:', result);
      return true;
    } else {
      console.warn('⚠️  API 健康檢查失敗:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API 健康檢查錯誤:', error);
    return false;
  }
}