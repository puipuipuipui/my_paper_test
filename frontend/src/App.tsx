import React from 'react';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/lib/locale/zh_TW';
import Header from './components/Header';
import Footer from './components/Footer';
import TestPage from './pages/TestPage';
import { TEST_PHASES } from './constants/testConstants';
import useTestLogic from './hooks/useTestLogic';
import "./styles/main.css";
import "./styles/biased-products.css";
import "./styles/results-page.css"; // 新增引入結果頁面樣式

// 注册 ECharts 必須的組件
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer
]);

function App() {
  // 獲取當前階段（僅用於頁頭進度條）
  // 修正: 使用新的 maxTestCounts 屬性替代舊的 maxTestCount
  const { currentPhase } = useTestLogic({ 
    maxTestCounts: {
      gender_practice: 10,
      product_practice: 10,
      combined_test_1: 20,
      reversed_practice: 10,
      combined_test_2: 20
    } 
  });

  return (
    <ConfigProvider locale={zhTW}>
      <div className="app-container">
        {/* 頁頭進度條 */}
        <Header currentPhase={currentPhase} />
        
        {/* 主要內容區域 */}
        <div className="app-content">
          <div className="content-wrapper">
            {/* 不需要傳遞任何屬性到 TestPage，因為它自己內部使用 useTestLogic */}
            <TestPage />
          </div>
        </div>
        
        {/* 頁尾 */}
        <Footer />
      </div>
    </ConfigProvider>
  );
}

export default App;