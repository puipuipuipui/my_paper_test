import React from 'react';
import { FeedbackType } from '../types/testTypes';
import CategoryLabels from './CategoryLabels';
import Instructions from './Instructions';
import { TestPhase } from '../types/testTypes';

interface TestContentProps {
  currentPhase: TestPhase;
  currentWord: string;
  feedback: FeedbackType;
  testCount: number;
  maxTestCount: number;
  showInstructions: boolean;
  onStartTest: () => void;
}

function TestContent({
  currentPhase,
  currentWord,
  feedback,
  testCount,
  maxTestCount,
  showInstructions,
  onStartTest
}: TestContentProps) {
  const getTestWordClass = () => {
    let className = "test-word";
    if (feedback === 'correct') {
      className += " correct";
    } else if (feedback === 'incorrect') {
      className += " incorrect";
    }
    return className;
  };

  return (
    <div className="content-container">
      <CategoryLabels currentPhase={currentPhase} />
      <div className="test-word-container">
        <div className={getTestWordClass()}>
          {currentWord}
        </div>
      </div>
      <div className="test-progress">
        進度: {testCount}/{maxTestCount}
      </div>
      <Instructions 
        currentPhase={currentPhase} 
        visible={showInstructions} 
        onStart={onStartTest} 
      />
    </div>
  );
}

export default TestContent;