import React from 'react';
import { Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface CompletedPageProps {
  onRestart: () => void;
}

function CompletedPage({ onRestart }: CompletedPageProps) {
  // 不使用 Ant Design 的 Result 元件，而是創建自己的完成頁面樣式
  return (
    <div className="content-container text-center">
      <div className="custom-result success">
        <div className="icon-container">
          <CheckCircleOutlined className="success-icon" />
        </div>
        <h2 className="result-title">測試完成！</h2>
        <div className="result-subtitle">感謝您參與性別商品偏見測試</div>

        <div className="result-extra">
          <Paragraph className="mb-6" style={{ fontSize: '1.125rem', maxWidth: '800px', margin: '0 auto 24px' }}>
            您已完成本次實驗，誠摯感謝您的參與與配合！<br />
            您的回覆對我們的研究非常重要，將有助於深入了解人們在與聊天機器人互動時的感受與反應。<br />
            若您對本實驗有任何疑問，歡迎與研究團隊聯繫。再次感謝您的寶貴時間！
          </Paragraph>
          {/* <div className="button-container">
            <Button
              type="primary"
              size="large"
              onClick={onRestart}
              icon={<CheckCircleOutlined />}
              className="rounded-button large-button"
            >
              返回首頁
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default CompletedPage;