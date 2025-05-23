import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface StartPageProps {
  onStart: () => void;
}

function StartPage({ onStart }: StartPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="max-w-2xl">
        <img
          src="https://readdy.ai/api/search-image?query=A%20balanced%20composition%20showing%20gender%20and%20product%20categories%2C%20with%20male%20and%20female%20silhouettes%20alongside%20tech%20gadgets%20and%20skincare%20products.%20Modern%2C%20clean%20design%20with%20soft%20gradient%20background%2C%20professional%20illustration%20style%2C%20suitable%20for%20psychological%20test&width=600&height=300&seq=1&orientation=landscape"
          alt="IAT測驗"
          className="mb-8 rounded-lg shadow-md w-full object-cover object-top"
        />
        <Title level={1} className="mb-6">性別與商品偏見測試</Title>
        <Paragraph className="text-lg mb-8">
          這個測試旨在探索我們對不同性別與產品類別之間可能存在的潛在聯繫。<br />
          測試過程中，您將被要求快速對詞語進行分類，整個過程約需 5-10 分鐘。您的反應時間將被用來分析潛在的無意識偏見。
        </Paragraph>
        
        <Button
          type="primary"
          size="large"
          onClick={onStart}
          icon={<ArrowRightOutlined />}
          className="!rounded-button text-lg h-12 px-8 whitespace-nowrap"
          style={{ marginBottom: -8 }}
        >
          開始測試
        </Button>
        <Paragraph className="mt-4 text-gray-500" style={{ marginBottom: -8 }}>
          預計完成時間：5-10 分鐘
        </Paragraph>
      </div>
    </div>
  );
};

export default StartPage;