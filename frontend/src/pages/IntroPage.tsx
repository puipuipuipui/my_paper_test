import React from 'react';
import { Button, Typography, Table } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { CustomCard } from '../components/CustomComponents';

const { Title, Paragraph, Text } = Typography;

interface IntroPageProps {
  onStart: () => void;
}

function IntroPage({ onStart }: IntroPageProps) {
  // 定義表格列
  const columns = [
    {
      title: '類別',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '字彙',
      dataIndex: 'words',
      key: 'words',
      width: '80%',
    },
  ];

  // 表格數據
  const data = [
    {
      key: '1',
      category: '男性',
      words: '男孩、叔叔、丈夫、爸爸、爺爺',
    },
    {
      key: '2',
      category: '女性',
      words: '女孩、阿姨、妻子、母親、奶奶',
    },
    {
      key: '3',
      category: '電腦類',
      words: '機械鍵盤、電競滑鼠、曲面螢幕、顯示卡、水冷散熱器',
    },
    {
      key: '4',
      category: '護膚類',
      words: '面膜、精華液、保濕霜、眼霜、乳液',
    },
  ];

  return (
    <div className="content-container">
      <Title level={2} className="text-center mb-6" style={{ marginTop: '4px' }}>測試說明</Title>
      <CustomCard className="mb-6" style={{ boxShadow: 'var(--box-shadow)' }}>
        <Paragraph style={{ fontSize: '1.125rem', marginBottom: '20px' }}>
          接下來，您將會看到一組字詞並進行分類。分類要盡可能地快，但同時又盡可能少犯錯。
        </Paragraph>
        
        <Paragraph style={{ fontSize: '1.125rem', marginBottom: '20px' }}>
          以下列出了類別標題以及屬於那些類別的項目：
        </Paragraph>
        
        {/* 使用表格顯示類別和字彙 */}
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false}
          bordered
          className="mb-4"
          size="middle"
        />
        
        <Title level={4} style={{ marginTop: '-10px', marginBottom: '-10px' }}>注意：</Title>
        <ul style={{ fontSize: '1.12rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>請把您的食指放在「E鍵和I鍵」上以確保能最快反應。</li>
          <li style={{ marginBottom: '8px' }}>上面的標題會告訴您哪一個字應該歸類到哪一個反應鍵。</li>
          <li style={{ marginBottom: '8px' }}>請盡可能快速並正確地分類每一項，太慢的分類會導致資料無效。</li>
          <li style={{ marginBottom: '8px' }}>如果您反應錯誤，會看到提示訊息，請修正答案。</li>
          <li style={{ marginBottom: '8px' }}>系統將會記錄您的反應時間。</li>
          <li style={{ marginBottom: '8px' }}>為了得到有效的結果，避免在實驗中走神或出神。</li>
        </ul>
      </CustomCard>
      
      <div className="text-center">
        <Button
          type="primary"
          size="large"
          onClick={onStart}
          icon={<ExperimentOutlined />}
          className="rounded-button large-button"
        >
          開始測試
        </Button>
      </div>
    </div>
  );
}

export default IntroPage;