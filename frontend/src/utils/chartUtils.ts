import * as echarts from 'echarts/core';

export interface ChartData {
  avgMaleComputer: number;
  avgFemaleSkincare: number;
  avgFemaleComputer: number;
  avgMaleSkincare: number;
}

export const createResultsChart = (chartElement: HTMLDivElement, data: ChartData): (() => void) => {
  if (!chartElement) return () => {}; // 確保返回一個清理函數
  
  // 首先檢查是否已經有 ECharts 實例，如果有則先銷毀
  const existingChart = echarts.getInstanceByDom(chartElement);
  if (existingChart) {
    existingChart.dispose();
  }
  
  // 初始化新的圖表，並設置渲染模式為 'canvas'，以確保更好的相容性
  const chart = echarts.init(chartElement, null, {
    renderer: 'canvas',
    useDirtyRect: false // 禁用臟矩形優化，避免某些渲染問題
  });
  
  // 計算最大值以設置 y 軸範圍
  const maxValue = Math.max(
    data.avgMaleComputer,
    data.avgFemaleSkincare,
    data.avgFemaleComputer,
    data.avgMaleSkincare
  ) * 1.2; // 增加 20% 的空間
  
  const option = {
    animation: false, // 禁用動畫，可以改善初始渲染
    title: {
      text: '反應時間分析 (毫秒)',
      left: 'center', // 標題仍然置中
      top: 10,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const dataIndex = params[0].dataIndex;
        let explanation = '';
        
        switch(dataIndex) {
          case 0:
            explanation = '男性+電腦: 傳統組合，反應時間較短表示對此組合接受度高';
            break;
          case 1:
            explanation = '女性+護膚: 傳統組合，反應時間較短表示對此組合接受度高';
            break;
          case 2:
            explanation = '女性+電腦: 非傳統組合，反應時間較長表示可能存在偏見';
            break;
          case 3:
            explanation = '男性+護膚: 非傳統組合，反應時間較長表示可能存在偏見';
            break;
        }
        
        return params[0].name + '<br/>' + 
               params[0].marker + ' 反應時間: ' + params[0].value + ' ms<br/>' +
               '<div style="margin-top:5px;font-size:12px;color:#999;">' + explanation + '</div>';
      }
    },
    legend: {
      data: ['傳統性別組合', '非傳統性別組合'],
      bottom: 10,
      left: 'center' // 圖例仍然置中
    },
    grid: {
      left: '8%',  // 增加左側空間，使圖表整體向右移動一些
      right: '8%', // 保持右側空間，以平衡整體布局
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['男性+電腦', '女性+護膚', '女性+電腦', '男性+護膚'],
      axisLabel: {
        interval: 0,
        rotate: 0,
        formatter: function(value: string) {
          // 為標籤添加換行以提高可讀性
          return value.replace('+', '+\n');
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '反應時間 (ms)',
      min: 0,
      max: maxValue,
      axisLine: {
        show: true,
      },
      axisTick: {
        show: true,
      },
    },
    series: [
      {
        name: '反應時間',
        type: 'bar',
        barWidth: '50%', // 設置條形寬度為更合適的值
        data: [
          { 
            value: Math.round(data.avgMaleComputer), 
            itemStyle: { color: '#91cc75' },
            tooltip: { formatter: '傳統組合: 男性與電腦類' }
          },
          { 
            value: Math.round(data.avgFemaleSkincare), 
            itemStyle: { color: '#91cc75' },
            tooltip: { formatter: '傳統組合: 女性與護膚類' }
          },
          { 
            value: Math.round(data.avgFemaleComputer), 
            itemStyle: { color: '#ee6666' },
            tooltip: { formatter: '非傳統組合: 女性與電腦類' }
          },
          { 
            value: Math.round(data.avgMaleSkincare), 
            itemStyle: { color: '#ee6666' },
            tooltip: { formatter: '非傳統組合: 男性與護膚類' }
          }
        ],
        label: {
          show: true,
          position: 'top',
          formatter: '{c} ms',
          fontSize: 12,
          color: '#333'
        },
        markLine: {
          silent: true, // 禁用點擊交互
          symbol: 'none', // 不顯示標記點
          lineStyle: {
            type: 'dashed',
            width: 1
          },
          data: [
            {
              name: '平均反應時間',
              type: 'average',
              lineStyle: {
                color: '#73c0de',
                type: 'dashed'
              },
              label: {
                position: 'end',
                formatter: '平均: {c} ms',
                fontSize: 12,
                color: '#73c0de'
              }
            }
          ]
        }
      }
    ]
  };
    
  // 設置圖表選項
  chart.setOption(option);
  
  // 強制更新佈局，確保圖表正確顯示
  setTimeout(() => {
    chart.resize();
  }, 0);
  
  // 響應窗口大小變化
  const resizeHandler = () => {
    chart.resize();
  };
  
  window.addEventListener('resize', resizeHandler);
  
  // 返回清理函數
  return () => {
    chart.dispose();
    window.removeEventListener('resize', resizeHandler);
  };
};