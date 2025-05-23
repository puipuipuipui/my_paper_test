import React from 'react';
import { TestPhase } from '../types/testTypes';
import { TEST_PHASES } from '../constants/testConstants';

interface CategoryLabelsProps {
  currentPhase: TestPhase;
}

function CategoryLabels({ currentPhase }: CategoryLabelsProps) {
  // 獲取當前階段的標籤
  const getCategoryLabels = (): { leftLabels: string[], rightLabels: string[] } => {
    let leftLabels: string[] = [];
    let rightLabels: string[] = [];
    
    switch (currentPhase) {
      case TEST_PHASES.GENDER_PRACTICE:
        leftLabels = ['男性'];
        rightLabels = ['女性'];
        break;
      case TEST_PHASES.PRODUCT_PRACTICE:
        leftLabels = ['電腦類'];
        rightLabels = ['護膚類'];
        break;
      case TEST_PHASES.COMBINED_TEST_1:
        leftLabels = ['男性', '電腦類'];
        rightLabels = ['女性', '護膚類'];
        break;
      case TEST_PHASES.REVERSED_PRACTICE:
        leftLabels = ['女性'];
        rightLabels = ['男性'];
        break;
      case TEST_PHASES.COMBINED_TEST_2:
        leftLabels = ['女性', '電腦類'];
        rightLabels = ['男性', '護膚類'];
        break;
      default:
        return { leftLabels: [], rightLabels: [] };
    }
    
    return { leftLabels, rightLabels };
  };

  const { leftLabels, rightLabels } = getCategoryLabels();
  
  // 如果沒有標籤，則不渲染
  if (leftLabels.length === 0 && rightLabels.length === 0) {
    return null;
  }

  return (
    <div className="categories-container">
      {/* Left Column */}
      <div className="category-column">
        <div className="key-hint">
          <div className="key-hint-text">按 E 鍵</div>
        </div>
        <div className="categories-list">
          {leftLabels.map((label, index) => (
            <div key={index} className="category-label">
              <div className="category-text">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="category-column">
        <div className="key-hint">
          <div className="key-hint-text">按 I 鍵</div>
        </div>
        <div className="categories-list">
          {rightLabels.map((label, index) => (
            <div key={index} className="category-label">
              <div className="category-text">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryLabels;