import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Instructions from '../components/Instructions';
import TestContent from '../components/TestContent';
import { TEST_PHASES } from '../constants/testConstants';
import useTestLogic from '../hooks/useTestLogic';
import StartPage from './StartPage';
import IntroPage from './IntroPage';
import ResultsPage from './ResultsPage';
import VideoPage from './VideoPage';
import SurveyPage from './SurveyPage';
import CompletedPage from './CompletedPage';

function TestPage() {
  // 設置不同階段的測試次數
  // 第一次: 10 (gender_practice)
  // 第二次: 10 (product_practice)
  // 第三次: 20 (combined_test_1)
  // 第四次: 10 (reversed_practice)
  // 第五次: 20 (combined_test_2)
  const {
    currentPhase,
    currentWord,
    currentWordType,
    feedback,
    testResults,
    testCount,
    maxTestCount, // 現在會根據當前階段返回對應的值
    showInstructions,
    biasType,
    biasLevel,
    dScore,
    biasedProducts,
    // 新增加的IAT詳細分析數據
    biasDirection,
    d1Score,
    d2Score,
    d3Score,
    d4Score,
    checkAnswer,
    moveToNextPhase,
    startTest,
    startNewTest
  } = useTestLogic({ 
    maxTestCounts: {
      gender_practice: 10,      // 第一階段：性別練習 - 10次
      product_practice: 10,     // 第二階段：產品練習 - 10次 
      combined_test_1: 20,      // 第三階段：組合測試1 - 20次
      reversed_practice: 10,    // 第四階段：反向練習 - 10次
      combined_test_2: 20       // 第五階段：組合測試2 - 20次
    }
  });

  // 偵測鍵盤輸入
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentPhase === TEST_PHASES.GENDER_PRACTICE || 
          currentPhase === TEST_PHASES.PRODUCT_PRACTICE || 
          currentPhase === TEST_PHASES.COMBINED_TEST_1 || 
          currentPhase === TEST_PHASES.REVERSED_PRACTICE || 
          currentPhase === TEST_PHASES.COMBINED_TEST_2) {
        
        if (!showInstructions) {
          if (e.key === 'e' || e.key === 'E') {
            checkAnswer('left');
          } else if (e.key === 'i' || e.key === 'I') {
            checkAnswer('right');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhase, showInstructions, checkAnswer]);

  // 重新開始測試的處理函數
  const handleRestart = () => {
    startNewTest();
    // 回到開始頁面
  };

  // 渲染當前階段
  const renderPhase = () => {
    switch (currentPhase) {
      case TEST_PHASES.START:
        return <StartPage onStart={moveToNextPhase} />;
      case TEST_PHASES.INTRO:
        return <IntroPage onStart={moveToNextPhase} />;
      case TEST_PHASES.GENDER_PRACTICE:
      case TEST_PHASES.PRODUCT_PRACTICE:
      case TEST_PHASES.COMBINED_TEST_1:
      case TEST_PHASES.REVERSED_PRACTICE:
      case TEST_PHASES.COMBINED_TEST_2:
        return (
          <div className="test-container">
            {showInstructions ? (
              <Instructions 
                currentPhase={currentPhase} 
                visible={showInstructions}
                onStart={startTest} 
              />
            ) : (
              <TestContent 
                currentPhase={currentPhase}
                currentWord={currentWord}
                feedback={feedback}
                testCount={testCount}
                maxTestCount={maxTestCount} // 動態根據當前階段取得對應的最大測試次數
                showInstructions={showInstructions}
                onStartTest={startTest}
              />
            )}
          </div>
        );
      case TEST_PHASES.RESULTS:
        return (
          <ResultsPage 
            testResults={testResults}
            biasType={biasType}
            biasLevel={biasLevel}
            dScore={dScore}
            biasedProducts={biasedProducts}
            // 傳遞新增加的IAT詳細分析數據
            biasDirection={biasDirection}
            d1={d1Score}
            d2={d2Score}
            d3={d3Score}
            d4={d4Score}
            onContinue={moveToNextPhase}
          />
        );
      case TEST_PHASES.VIDEO:
        return <VideoPage onContinue={moveToNextPhase} />;
      case TEST_PHASES.SURVEY:
        return <SurveyPage onComplete={moveToNextPhase} />;
      case TEST_PHASES.COMPLETED:
        return <CompletedPage onRestart={handleRestart} />;
      default:
        return <StartPage onStart={moveToNextPhase} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      {renderPhase()}
    </motion.div>
  );
}

export default TestPage;