import React, { useEffect, useRef } from 'react';
import { Button, Typography, Progress, Tabs, Divider, Table } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { TestResults } from '../types/testTypes';
import { createResultsChart } from '../utils/chartUtils';
import { CustomCard } from '../components/CustomComponents';
import '../styles/results-page.css'; // CSS 文件
import { saveTestResults } from '../utils/api';

const { Title, Paragraph, Text } = Typography;

interface ResultsPageProps {
  testResults: TestResults;
  biasType: string; // 改名: biasedProduct -> biasType
  biasLevel: string;
  dScore: number;
  biasedProducts: Array<{ name: string; score: number }>;
  biasDirection?: string;
  d1?: number;
  d2?: number;
  d3?: number;
  d4?: number;
  onContinue: () => void;
}

function ResultsPage({
  testResults,
  biasType, // 改名: biasedProduct -> biasType
  biasLevel,
  dScore,
  biasedProducts,
  biasDirection = '',
  d1, d2, d3, d4,
  onContinue
}: ResultsPageProps) {
  const chartRef = useRef(null);

  // 計算各組的平均反應時間
  const avgMaleComputer = testResults.maleComputer.length > 0 ?
    testResults.maleComputer.reduce((a, b) => a + b, 0) / testResults.maleComputer.length : 0;

  const avgFemaleSkincare = testResults.femaleSkincare.length > 0 ?
    testResults.femaleSkincare.reduce((a, b) => a + b, 0) / testResults.femaleSkincare.length : 0;

  const avgFemaleComputer = testResults.femaleComputer.length > 0 ?
    testResults.femaleComputer.reduce((a, b) => a + b, 0) / testResults.femaleComputer.length : 0;

  const avgMaleSkincare = testResults.maleSkincare.length > 0 ?
    testResults.maleSkincare.reduce((a, b) => a + b, 0) / testResults.maleSkincare.length : 0;

  // 計算標準差
  const calculateStandardDeviation = (values: number[]): number => {
    if (values.length <= 1) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squareDiffs.reduce((sum, diff) => sum + diff, 0) / (values.length - 1);

    return Math.sqrt(variance);
  };

  // 計算各組合的標準差
  const sdGenderComputer = calculateStandardDeviation([...testResults.maleComputer, ...testResults.femaleComputer]);
  const sdGenderSkincare = calculateStandardDeviation([...testResults.maleSkincare, ...testResults.femaleSkincare]);
  const sdMaleProduct = calculateStandardDeviation([...testResults.maleComputer, ...testResults.maleSkincare]);
  const sdFemaleProduct = calculateStandardDeviation([...testResults.femaleComputer, ...testResults.femaleSkincare]);
  const sdAll = calculateStandardDeviation([
    ...testResults.maleComputer,
    ...testResults.femaleSkincare,
    ...testResults.femaleComputer,
    ...testResults.maleSkincare
  ]);

  // 計算傳統與非傳統組合的平均反應時間
  const avgTraditional = (avgMaleComputer + avgFemaleSkincare) / 2;
  const avgNonTraditional = (avgFemaleComputer + avgMaleSkincare) / 2;

  // 建立圖表
  useEffect(() => {
    // 如果圖表容器不存在，返回一個空的清理函數
    if (!chartRef.current) return () => { };

    // 創建圖表
    const cleanupChart = createResultsChart(chartRef.current, {
      avgMaleComputer,
      avgFemaleSkincare,
      avgFemaleComputer,
      avgMaleSkincare
    });

    // 確保返回一個函數，即使 cleanupChart 可能不是函數
    return typeof cleanupChart === 'function' ? cleanupChart : () => { };
  }, [avgMaleComputer, avgFemaleSkincare, avgFemaleComputer, avgMaleSkincare]);

  // 在這裡添加新的 useEffect，用於儲存測試結果
  useEffect(() => {
    const saveData = async () => {
      try {
        await saveTestResults({
          testResults,
          dScore,
          biasType,
          biasLevel,
          biasDirection,
          d1Score: d1,
          d2Score: d2,
          d3Score: d3,
          d4Score: d4
        });
        console.log('✅ 測試結果已儲存');
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('❌ 儲存測試結果失敗:', error.message);
        } else {
          console.error('❌ 儲存測試結果失敗:', String(error));
        }
        // 即使儲存失敗也不影響用戶體驗，只記錄錯誤
      }
    };
  
    // 只有當有實際測試數據時才儲存
    const hasData = testResults.maleComputer.length > 0 || 
                   testResults.femaleSkincare.length > 0 || 
                   testResults.femaleComputer.length > 0 || 
                   testResults.maleSkincare.length > 0;
    
    if (hasData) {
      saveData();
    }
  }, [testResults, dScore, biasType, biasLevel, biasDirection, d1, d2, d3, d4]); // 加上完整的依賴陣列

  // 根據 biasType 生成適當的結果解釋
  const getBiasExplanation = () => {
    if (!biasType || biasLevel === '無或極弱偏見') {
      return (
        <Paragraph style={{ fontSize: '1.125rem' }}>
          根據您的反應時間分析，您在不同性別與產品組合的測試中反應時間差異不明顯。
          這表示您可能<Text strong style={{ fontSize: '1.25rem' }}> 沒有明顯的性別商品偏見</Text>，
          或偏見程度非常輕微。
        </Paragraph>
      );
    }

    if (biasType === 'gender_tech') { // 改名: '電競滑鼠' -> 'gender_tech'
      return (
        <Paragraph style={{ fontSize: '1.125rem' }}>
          根據您的反應時間分析，我們發現您在<Text strong style={{ fontSize: '1.25rem' }}> 女性與電腦類 </Text>
          組合的測試中反應較慢，表示可能存在潛在聯想障礙。這顯示您可能對「女性使用電腦類產品」存在
          <Text strong style={{ fontSize: '1.25rem', color: getBiasLevelColor() }}> {biasLevel} </Text>
          的性別刻板印象，傾向於將電腦類產品視為更適合男性的產品。
        </Paragraph>
      );
    } else { // biasType === 'gender_skincare'
      return (
        <Paragraph style={{ fontSize: '1.125rem' }}>
          根據您的反應時間分析，我們發現您在<Text strong style={{ fontSize: '1.25rem' }}> 男性與護膚類 </Text>
          組合的測試中反應較慢，表示可能存在潛在聯想障礙。這顯示您可能對「男性使用護膚類產品」存在
          <Text strong style={{ fontSize: '1.25rem', color: getBiasLevelColor() }}> {biasLevel} </Text>
          的性別刻板印象，傾向於將護膚類產品視為更適合女性的產品。
        </Paragraph>
      );
    }
  };

  // 根據偏見程度獲取顏色
  const getBiasLevelColor = () => {
    switch (biasLevel) {
      case '高度偏見': return '#f5222d'; // 紅色
      case '中度偏見': return '#fa8c16'; // 橙色
      case '輕度偏見': return '#faad14'; // 黃色
      default: return '#52c41a'; // 綠色 (無偏見)
    }
  };

  // 獲取偏見程度的百分比
  const getBiasPercentage = () => {
    const absScore = Math.abs(dScore);
    // 將 D 值轉換為百分比 (0.65+ 視為 100%)
    return Math.min(Math.round(absScore / 0.65 * 100), 100);
  };

  // 獲取進度條的狀態
  const getProgressStatus = () => {
    if (biasLevel === '無或極弱偏見') return 'success';
    if (biasLevel === '輕度偏見') return 'success';
    if (biasLevel === '中度偏見') return 'warning';
    if (biasLevel === '高度偏見') return 'exception';
    return 'normal';
  };

  // 原始反應時間數據表格
  const reactionsColumns = [
    {
      title: '測試組合',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '平均反應時間 (ms)',
      dataIndex: 'avgTime',
      key: 'avgTime',
      render: (text: number) => Math.round(text)
    },
    {
      title: '樣本數',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '最小值 (ms)',
      dataIndex: 'min',
      key: 'min',
      render: (text: number | string) => typeof text === 'number' ? Math.round(text) : text
    },
    {
      title: '最大值 (ms)',
      dataIndex: 'max',
      key: 'max',
      render: (text: number | string) => typeof text === 'number' ? Math.round(text) : text
    }
  ];

  // 計算最小和最大值
  const getMinMax = (arr: number[]) => {
    if (arr.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...arr),
      max: Math.max(...arr)
    };
  };

  const reactionsData = [
    {
      key: '1',
      type: '男性+電腦類（傳統）',
      avgTime: avgMaleComputer,
      count: testResults.maleComputer.length,
      ...getMinMax(testResults.maleComputer)
    },
    {
      key: '2',
      type: '女性+護膚類（傳統）',
      avgTime: avgFemaleSkincare,
      count: testResults.femaleSkincare.length,
      ...getMinMax(testResults.femaleSkincare)
    },
    {
      key: '3',
      type: '女性+電腦類（非傳統）',
      avgTime: avgFemaleComputer,
      count: testResults.femaleComputer.length,
      ...getMinMax(testResults.femaleComputer)
    },
    {
      key: '4',
      type: '男性+護膚類（非傳統）',
      avgTime: avgMaleSkincare,
      count: testResults.maleSkincare.length,
      ...getMinMax(testResults.maleSkincare)
    },
    {
      key: '5',
      type: '傳統組合（平均）',
      avgTime: avgTraditional,
      count: testResults.maleComputer.length + testResults.femaleSkincare.length,
      min: '-',
      max: '-'
    },
    {
      key: '6',
      type: '非傳統組合（平均）',
      avgTime: avgNonTraditional,
      count: testResults.femaleComputer.length + testResults.maleSkincare.length,
      min: '-',
      max: '-'
    }
  ];

  // D分數計算結果表格
  const dScoreColumns = [
    {
      title: 'D分數類型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'D值',
      dataIndex: 'value',
      key: 'value',
      render: (text: number) => text.toFixed(3)
    },
    {
      title: '解釋',
      dataIndex: 'explanation',
      key: 'explanation',
    },
    {
      title: '偏見程度',
      dataIndex: 'level',
      key: 'level',
      render: (text: string) => {
        const color = text.includes('高度') ? '#f5222d' :
          text.includes('中度') ? '#fa8c16' :
            text.includes('輕度') ? '#faad14' : '#52c41a';
        return <Text style={{ color }}>{text}</Text>;
      }
    }
  ];

  // 獲取偏見程度
  const getBiasLevel = (dValue: number) => {
    const absD = Math.abs(dValue);
    if (absD < 0.15) return '無或極弱偏見';
    if (absD < 0.35) return '輕度偏見';
    if (absD < 0.65) return '中度偏見';
    return '高度偏見';
  };

  // 獲取D分數解釋
  const getDScoreExplanation = (dValue: number, type: string) => {
    if (Math.abs(dValue) < 0.15) return '無明顯差異';

    if (type === 'D1') {
      return dValue > 0 ? '女性與電腦配對反應較慢' : '男性與電腦配對反應較慢';
    } else if (type === 'D2') {
      return dValue > 0 ? '男性與護膚配對反應較慢' : '女性與護膚配對反應較慢';
    } else if (type === 'D3') {
      return dValue > 0 ? '男性與護膚類配對反應較慢' : '男性與電腦類配對反應較慢';
    } else if (type === 'D4') {
      return dValue > 0 ? '女性與電腦類配對反應較慢' : '女性與護膚類配對反應較慢';
    } else {
      return dValue > 0 ? '非傳統組合反應較慢（存在傳統性別刻板印象）' : '傳統組合反應較慢（存在反向性別刻板印象）';
    }
  };

  const dScoreData = [
    {
      key: '1',
      type: 'D1 (性別-電腦類聯想)',
      value: d1 || 0,
      explanation: getDScoreExplanation(d1 || 0, 'D1'),
      level: getBiasLevel(d1 || 0)
    },
    {
      key: '2',
      type: 'D2 (性別-護膚類聯想)',
      value: d2 || 0,
      explanation: getDScoreExplanation(d2 || 0, 'D2'),
      level: getBiasLevel(d2 || 0)
    },
    {
      key: '3',
      type: 'D3 (男性-產品類別聯想)',
      value: d3 || 0,
      explanation: getDScoreExplanation(d3 || 0, 'D3'),
      level: getBiasLevel(d3 || 0)
    },
    {
      key: '4',
      type: 'D4 (女性-產品類別聯想)',
      value: d4 || 0,
      explanation: getDScoreExplanation(d4 || 0, 'D4'),
      level: getBiasLevel(d4 || 0)
    },
    {
      key: '5',
      type: '綜合D分數',
      value: dScore,
      explanation: getDScoreExplanation(dScore, 'D'),
      level: biasLevel
    }
  ];

  // 計算詳細信息
  const calculationDetails = [
    { label: '男性+電腦類平均反應時間', value: `${Math.round(avgMaleComputer)} ms` },
    { label: '女性+護膚類平均反應時間', value: `${Math.round(avgFemaleSkincare)} ms` },
    { label: '女性+電腦類平均反應時間', value: `${Math.round(avgFemaleComputer)} ms` },
    { label: '男性+護膚類平均反應時間', value: `${Math.round(avgMaleSkincare)} ms` },
    { label: '傳統組合平均反應時間', value: `${Math.round(avgTraditional)} ms` },
    { label: '非傳統組合平均反應時間', value: `${Math.round(avgNonTraditional)} ms` },
    { label: '反應時間差異', value: `${Math.round(avgNonTraditional - avgTraditional)} ms` },
    { label: '標準差（全部組合）', value: `${sdAll.toFixed(2)} ms` },
    { label: '標準差（性別-電腦類）', value: `${sdGenderComputer.toFixed(2)} ms` },
    { label: '標準差（性別-護膚類）', value: `${sdGenderSkincare.toFixed(2)} ms` },
    { label: '標準差（男性-產品類別）', value: `${sdMaleProduct.toFixed(2)} ms` },
    { label: '標準差（女性-產品類別）', value: `${sdFemaleProduct.toFixed(2)} ms` },
    { label: 'D1分數計算公式', value: `(${Math.round(avgFemaleComputer)} - ${Math.round(avgMaleComputer)}) ÷ ${sdGenderComputer.toFixed(2)} = ${(d1 || 0).toFixed(3)}` },
    { label: 'D2分數計算公式', value: `(${Math.round(avgMaleSkincare)} - ${Math.round(avgFemaleSkincare)}) ÷ ${sdGenderSkincare.toFixed(2)} = ${(d2 || 0).toFixed(3)}` },
    { label: 'D3分數計算公式', value: `(${Math.round(avgMaleSkincare)} - ${Math.round(avgMaleComputer)}) ÷ ${sdMaleProduct.toFixed(2)} = ${(d3 || 0).toFixed(3)}` },
    { label: 'D4分數計算公式', value: `(${Math.round(avgFemaleComputer)} - ${Math.round(avgFemaleSkincare)}) ÷ ${sdFemaleProduct.toFixed(2)} = ${(d4 || 0).toFixed(3)}` },
    { label: '綜合D分數計算公式', value: `(${Math.round(avgNonTraditional)} - ${Math.round(avgTraditional)}) ÷ ${sdAll.toFixed(2)} = ${dScore.toFixed(3)}` },
  ];

  const tabItems = [
    {
      key: "1",
      label: "反應時間數據",
      children: (
        <>
          <Paragraph>
            以下表格顯示了各組合的反應時間數據統計：
          </Paragraph>
          <Table
            dataSource={reactionsData}
            columns={reactionsColumns}
            pagination={false}
            bordered
            size="middle"
          />
        </>
      )
    },
    {
      key: "2", 
      label: "D分數計算結果",
      children: (
        <>
          <Paragraph>
            以下表格顯示了各種D分數的計算結果和解釋：
          </Paragraph>
          <Table
            dataSource={dScoreData}
            columns={dScoreColumns}
            pagination={false}
            bordered
            size="middle"
          />
        </>
      )
    },
    {
      key: "3",
      label: "計算詳情", 
      children: (
        <>
          <Paragraph>
            IAT測試數據計算詳情：
          </Paragraph>
          <ul className="calculation-details">
            {calculationDetails.map((item, index) => (
              <li key={index}>
                <Text strong>{item.label}：</Text> {item.value}
              </li>
            ))}
          </ul>
          <Divider />
          <div className="bias-level-explanation">
            <Paragraph>
              <Text strong>D分數解釋：</Text>
            </Paragraph>
            <ul>
              <li>|D| &lt; 0.15：無明顯偏見</li>
              <li>0.15 ≤ |D| &lt; 0.35：輕度偏見</li>
              <li>0.35 ≤ |D| &lt; 0.65：中度偏見</li>
              <li>|D| ≥ 0.65：高度偏見</li>
            </ul>
            <Paragraph>
              正值D分數表示對傳統性別商品組合反應更快，對非傳統組合反應更慢，可能存在傳統性別刻板印象；
              負值D分數表示對非傳統組合反應更快，對傳統組合反應更慢，可能存在反向性別刻板印象。
            </Paragraph>
          </div>
        </>
      )
    },
    {
      key: "4",
      label: "原始數據",
      children: (
        <>
          <Paragraph>
            以下是各組合的原始反應時間數據（毫秒）：
          </Paragraph>
          <div className="raw-data-container">
            <div className="raw-data-section">
              <Text strong>男性+電腦類（傳統）：</Text>
              <div className="raw-data-list">
                {testResults.maleComputer.length > 0 ?
                  testResults.maleComputer.map((time, index) => (
                    <span key={index} className="raw-data-item">{Math.round(time)}</span>
                  )) :
                  <span>無數據</span>
                }
              </div>
            </div>
            <div className="raw-data-section">
              <Text strong>女性+護膚類（傳統）：</Text>
              <div className="raw-data-list">
                {testResults.femaleSkincare.length > 0 ?
                  testResults.femaleSkincare.map((time, index) => (
                    <span key={index} className="raw-data-item">{Math.round(time)}</span>
                  )) :
                  <span>無數據</span>
                }
              </div>
            </div>
            <div className="raw-data-section">
              <Text strong>女性+電腦類（非傳統）：</Text>
              <div className="raw-data-list">
                {testResults.femaleComputer.length > 0 ?
                  testResults.femaleComputer.map((time, index) => (
                    <span key={index} className="raw-data-item">{Math.round(time)}</span>
                  )) :
                  <span>無數據</span>
                }
              </div>
            </div>
            <div className="raw-data-section">
              <Text strong>男性+護膚類（非傳統）：</Text>
              <div className="raw-data-list">
                {testResults.maleSkincare.length > 0 ?
                  testResults.maleSkincare.map((time, index) => (
                    <span key={index} className="raw-data-item">{Math.round(time)}</span>
                  )) :
                  <span>無數據</span>
                }
              </div>
            </div>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="wide-container">
      <Title level={2} className="text-center mb-8">測試結果分析</Title>

      {/* 主要結果卡片 */}
      <div className="mb-8">
        <CustomCard style={{ boxShadow: 'var(--box-shadow)' }}>
          <div className="mb-6">
            <Title level={4}>您的偏見分析</Title>
            {getBiasExplanation()}

            {biasLevel !== '無或極弱偏見' && (
              <div className="mb-4 mt-4">
                <Text strong>偏見強度 (D 值: {dScore.toFixed(3)}):</Text>
                <Progress
                  percent={getBiasPercentage()}
                  status={getProgressStatus() as any}
                  strokeColor={getBiasLevelColor()}
                />
              </div>
            )}
          </div>

          {/* 修改後的圖表容器 */}
          <div className="chart-container-wrapper">
            <div ref={chartRef} className="chart-container"></div>
          </div>

          <Paragraph>
            此圖表顯示了您在不同組合下的平均反應時間（毫秒）。較短的反應時間表示您對這些組合的聯想更為自然，
            而較長的反應時間則可能表示這些組合與您的潛在認知存在衝突。
          </Paragraph>
          <Paragraph>
            <Text strong>左側兩個條形：</Text> 傳統性別商品組合（男性+電腦類、女性+護膚類）<br />
            <Text strong>右側兩個條形：</Text> 非傳統性別商品組合（女性+電腦類、男性+護膚類）
          </Paragraph>
        </CustomCard>
      </div>

      {/* 詳細反應時間和計算結果表格--------------------------------------------------------------------------------------------------------- */}
      <div className="mb-8">
        <CustomCard style={{ boxShadow: 'var(--box-shadow)' }}>
          <Title level={4}>
            <BarChartOutlined /> 詳細數據分析
          </Title>

          <Tabs defaultActiveKey="1" items={tabItems} />
          
        </CustomCard>
      </div>
      {/* --------------------------------------------------------------------------------------------------------- */}


      <div className="text-center">
        <Paragraph style={{ fontSize: '1.125rem', marginBottom: -10 }} className="mb-6">
          接下來，請您觀看一段的影片，並於觀看完畢後填寫問卷。
        </Paragraph>
        <div className="button-container">
          <Button
            type="primary"
            size="large"
            onClick={onContinue}
            icon={<PlayCircleOutlined />}
            className="rounded-button large-button"
          >
            觀看影片
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;

