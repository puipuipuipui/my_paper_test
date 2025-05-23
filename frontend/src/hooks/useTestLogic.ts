import { useState, useEffect } from 'react';
import { TestPhase, WordType, Side, TestResults, FeedbackType } from '../types/testTypes';
import { TEST_PHASES, maleWords, femaleWords, computerWords, skinCareWords } from '../constants/testConstants';
import { calculateDScore, generateBiasedProducts } from '../utils/biasCalculation';

interface UseTestLogicProps {
  maxTestCounts?: {
    gender_practice?: number; // 第一階段：性別練習
    product_practice?: number; // 第二階段：產品練習
    combined_test_1?: number; // 第三階段：組合測試1
    reversed_practice?: number; // 第四階段：反向練習
    combined_test_2?: number; // 第五階段：組合測試2
  };
}

interface BiasResults {
  dScore: number;
  biasLevel: string;
  biasType: string | null;
  biasDirection?: string;
  d1?: number;
  d2?: number;
  d3?: number;
  d4?: number;
  meanMaleComputer?: number;
  meanFemaleSkincare?: number;
  meanFemaleComputer?: number;
  meanMaleSkincare?: number;
  standardDeviation?: number;
}

const useTestLogic = ({ maxTestCounts = {} }: UseTestLogicProps = {}) => {
  const [currentPhase, setCurrentPhase] = useState<TestPhase>(TEST_PHASES.START);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentWordType, setCurrentWordType] = useState<WordType | ''>('');
  const [feedback, setFeedback] = useState<FeedbackType>('');
  const [testResults, setTestResults] = useState<TestResults>({
    maleComputer: [],
    femaleSkincare: [],
    femaleComputer: [],
    maleSkincare: []
  });
  const [testCount, setTestCount] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [biasType, setBiasType] = useState<string>('');
  const [biasLevel, setBiasLevel] = useState<string>('');
  const [dScore, setDScore] = useState<number>(0);
  const [biasedProducts, setBiasedProducts] = useState<Array<{ name: string, score: number }>>([]);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  
  // IAT分析詳細數據
  const [biasDirection, setBiasDirection] = useState<string>('');
  const [d1Score, setD1Score] = useState<number>(0);
  const [d2Score, setD2Score] = useState<number>(0);
  const [d3Score, setD3Score] = useState<number>(0);
  const [d4Score, setD4Score] = useState<number>(0);

  // 根據當前階段獲取最大測試次數
  const getMaxTestCount = (phase: TestPhase): number => {
    // 預設值
    const defaults = {
      [TEST_PHASES.GENDER_PRACTICE]: 10,
      [TEST_PHASES.PRODUCT_PRACTICE]: 10,
      [TEST_PHASES.COMBINED_TEST_1]: 20,
      [TEST_PHASES.REVERSED_PRACTICE]: 10,
      [TEST_PHASES.COMBINED_TEST_2]: 20
    };

    // 用戶設定的值（如果有）
    const userSettings = {
      [TEST_PHASES.GENDER_PRACTICE]: maxTestCounts.gender_practice,
      [TEST_PHASES.PRODUCT_PRACTICE]: maxTestCounts.product_practice,
      [TEST_PHASES.COMBINED_TEST_1]: maxTestCounts.combined_test_1,
      [TEST_PHASES.REVERSED_PRACTICE]: maxTestCounts.reversed_practice,
      [TEST_PHASES.COMBINED_TEST_2]: maxTestCounts.combined_test_2
    };

    // 返回用戶設定的值或預設值
    return userSettings[phase] || defaults[phase] || 10;
  };

  // 開始新的測試
  const startNewTest = () => {
    setTestCount(0);
    setShowInstructions(true);
    setUsedWords(new Set());
  };

  // 檢查答案
  const checkAnswer = (side: Side) => {
    const endTime = Date.now();
    const reactionTime = endTime - testStartTime;
    let isCorrect = false;

    // 檢查答案是否正確
    if (currentPhase === TEST_PHASES.GENDER_PRACTICE) {
      isCorrect = (side === 'left' && maleWords.includes(currentWord)) ||
        (side === 'right' && femaleWords.includes(currentWord));
    } else if (currentPhase === TEST_PHASES.PRODUCT_PRACTICE) {
      isCorrect = (side === 'left' && computerWords.includes(currentWord)) ||
        (side === 'right' && skinCareWords.includes(currentWord));
    } else if (currentPhase === TEST_PHASES.COMBINED_TEST_1) {
      isCorrect = (side === 'left' && (maleWords.includes(currentWord) || computerWords.includes(currentWord))) ||
        (side === 'right' && (femaleWords.includes(currentWord) || skinCareWords.includes(currentWord)));
    } else if (currentPhase === TEST_PHASES.REVERSED_PRACTICE) {
      isCorrect = (side === 'left' && femaleWords.includes(currentWord)) ||
        (side === 'right' && maleWords.includes(currentWord));
    } else if (currentPhase === TEST_PHASES.COMBINED_TEST_2) {
      isCorrect = (side === 'left' && (femaleWords.includes(currentWord) || computerWords.includes(currentWord))) ||
        (side === 'right' && (maleWords.includes(currentWord) || skinCareWords.includes(currentWord)));
    }

    // 設置反饋狀態
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // 如果答案正確
    if (isCorrect) {
      // 記錄反應時間
      if (currentPhase === TEST_PHASES.COMBINED_TEST_1) {
        // 區組1：男性+電腦類或女性+護膚類
        if (maleWords.includes(currentWord) || computerWords.includes(currentWord)) {
          setTestResults(prev => ({
            ...prev,
            maleComputer: [...prev.maleComputer, reactionTime]
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            femaleSkincare: [...prev.femaleSkincare, reactionTime]
          }));
        }
      } else if (currentPhase === TEST_PHASES.COMBINED_TEST_2) {
        // 區組2：女性+電腦類或男性+護膚類
        if (femaleWords.includes(currentWord) || computerWords.includes(currentWord)) {
          setTestResults(prev => ({
            ...prev,
            femaleComputer: [...prev.femaleComputer, reactionTime]
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            maleSkincare: [...prev.maleSkincare, reactionTime]
          }));
        }
      }

      // 增加測試計數
      const newCount = testCount + 1;
      setTestCount(newCount);

      // 獲取當前階段的最大測試次數
      const currentMaxTestCount = getMaxTestCount(currentPhase);

      // 顯示正確反饋後繼續
      setTimeout(() => {
        setFeedback('');
        if (newCount >= currentMaxTestCount) {
          moveToNextPhase();
        } else {
          selectNextWord();
        }
      }, 500);
    } else {
      // 如果答案錯誤，保持當前詞不變，等待正確答案
      setTimeout(() => {
        setFeedback('');
      }, 1000);
    }
  };

  // 選擇下一個詞
  const selectNextWord = () => {
    let wordPool: string[] = [];

    if (currentPhase === TEST_PHASES.GENDER_PRACTICE) {
      wordPool = [...maleWords, ...femaleWords];
    } else if (currentPhase === TEST_PHASES.PRODUCT_PRACTICE) {
      wordPool = [...computerWords, ...skinCareWords];
    } else if (currentPhase === TEST_PHASES.COMBINED_TEST_1 || currentPhase === TEST_PHASES.COMBINED_TEST_2) {
      wordPool = [...maleWords, ...femaleWords, ...computerWords, ...skinCareWords];
    } else if (currentPhase === TEST_PHASES.REVERSED_PRACTICE) {
      wordPool = [...maleWords, ...femaleWords];
    }

    // 過濾掉已使用的詞
    const availableWords = wordPool.filter(word => !usedWords.has(word));

    if (availableWords.length === 0) {
      moveToNextPhase();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];

    // 將選中的詞添加到已使用集合中
    setUsedWords(prev => {
      const newSet = new Set(prev);
      newSet.add(selectedWord);
      return newSet;
    });

    let wordType: WordType | '' = '';
    if (maleWords.includes(selectedWord)) {
      wordType = 'male';
    } else if (femaleWords.includes(selectedWord)) {
      wordType = 'female';
    } else if (computerWords.includes(selectedWord)) {
      wordType = 'computer';
    } else if (skinCareWords.includes(selectedWord)) {
      wordType = 'skincare';
    }

    setCurrentWord(selectedWord);
    setCurrentWordType(wordType);
    setTestStartTime(Date.now());
  };

  // 進入下一個測試階段
  const moveToNextPhase = () => {
    switch (currentPhase) {
      case TEST_PHASES.START:
        setCurrentPhase(TEST_PHASES.INTRO);
        break;
      case TEST_PHASES.INTRO:
        setCurrentPhase(TEST_PHASES.GENDER_PRACTICE);
        startNewTest();
        break;
      case TEST_PHASES.GENDER_PRACTICE:
        setCurrentPhase(TEST_PHASES.PRODUCT_PRACTICE);
        startNewTest();
        break;
      case TEST_PHASES.PRODUCT_PRACTICE:
        setCurrentPhase(TEST_PHASES.COMBINED_TEST_1);
        startNewTest();
        break;
      case TEST_PHASES.COMBINED_TEST_1:
        setCurrentPhase(TEST_PHASES.REVERSED_PRACTICE);
        startNewTest();
        break;
      case TEST_PHASES.REVERSED_PRACTICE:
        setCurrentPhase(TEST_PHASES.COMBINED_TEST_2);
        startNewTest();
        break;
      case TEST_PHASES.COMBINED_TEST_2:
        // 在進入結果頁面前計算結果
        calculateBiasResults();
        setCurrentPhase(TEST_PHASES.RESULTS);
        break;
      case TEST_PHASES.RESULTS:
        setCurrentPhase(TEST_PHASES.VIDEO);
        break;
      case TEST_PHASES.VIDEO:
        setCurrentPhase(TEST_PHASES.SURVEY);
        break;
      case TEST_PHASES.SURVEY:
        setCurrentPhase(TEST_PHASES.COMPLETED);
        break;
      default:
        setCurrentPhase(TEST_PHASES.START);
    }
  };

  // 開始測試 - 點擊開始測試按鈕時調用
  const startTest = () => {
    setShowInstructions(false);
    selectNextWord();
  };

  // 計算偏見結果 - 使用標準IAT D分數演算法
  const calculateBiasResults = () => {
    const result = calculateDScore(testResults);
    
    // 設置基本結果
    setDScore(result.dScore);
    setBiasLevel(result.biasLevel);

    // 設置詳細結果
    if (result.d1 !== undefined) setD1Score(result.d1);
    if (result.d2 !== undefined) setD2Score(result.d2);
    if (result.d3 !== undefined) setD3Score(result.d3);
    if (result.d4 !== undefined) setD4Score(result.d4);
    if (result.biasDirection !== undefined) setBiasDirection(result.biasDirection);

    if (result.biasType) {
      setBiasType(result.biasType);
      // 產生偏見產品列表
      const products = generateBiasedProducts(result.biasType, result.dScore);
      setBiasedProducts(products);
    } else {
      setBiasType('');
      setBiasedProducts([]);
    }

    return result;
  };

  return {
    currentPhase,
    currentWord,
    currentWordType,
    feedback,
    testResults,
    testCount,
    maxTestCount: getMaxTestCount(currentPhase), // 根據當前階段返回相應的最大測試次數
    showInstructions,
    biasType,
    biasLevel,
    dScore,
    biasedProducts,
    // IAT分析詳細數據
    biasDirection,
    d1Score,
    d2Score,
    d3Score,
    d4Score,
    startNewTest,
    checkAnswer,
    moveToNextPhase,
    startTest,
    calculateBiasResults
  };
};

export default useTestLogic;