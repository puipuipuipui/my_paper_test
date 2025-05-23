import React, { useState, useEffect } from 'react';
import { Button, Typography, Modal, Divider } from 'antd';
import { FormOutlined, InfoCircleOutlined, PlayCircleOutlined, SoundOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface VideoPageProps {
  onContinue: () => void;
}

function VideoPage({ onContinue }: VideoPageProps) {
  // 控制注意事項彈窗顯示
  const [noticeVisible, setNoticeVisible] = useState<boolean>(true);
  // 倒數計時器狀態
  const [countdown, setCountdown] = useState<number>(10);
  // 影片觀看時間追蹤
  const [videoStarted, setVideoStarted] = useState<boolean>(false);

  // 當用戶點擊「我已了解」按鈕時關閉提示並開始影片觀看
  const handleNoticeClose = () => {
    setNoticeVisible(false);
    setVideoStarted(true);
  };

  // 監聽影片開始播放，啟動倒數計時
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (videoStarted && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [videoStarted, countdown]);

  return (
    <div className="wide-container">
      {/* 影片注意事項彈跳視窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <PlayCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>影片觀看指引</span>
          </div>
        }
        open={noticeVisible}
        onCancel={handleNoticeClose}
        footer={[
          <Button
            key="understand"
            type="primary"
            size="large"
            onClick={handleNoticeClose}
            style={{
              padding: '0 32px',
              height: '42px',
              fontSize: '16px',
              borderRadius: '6px'
            }}
          >
            我已了解，開始觀看
          </Button>
        ]}
        centered
        maskClosable={false}
        width={600}
        bodyStyle={{
          padding: '24px 28px',
          backgroundColor: '#fafafa',
          borderRadius: '0 0 8px 8px'
        }}
        style={{
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div className="video-notice-content">
          {/* 第一段 */}
          <div className="notice-section" style={{
            marginBottom: '20px',
            padding: '16px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            borderLeft: '4px solid #1890ff'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Paragraph style={{
                fontSize: '1.1rem',
                margin: '0',
                lineHeight: '1.6',
                color: '#333'
              }}>
                在接下來的影片中，您將看到一段與聊天機器人互動的情境，內容關於詢問或購買一項商品。影片中的聊天機器人可能為男性或女性語音。
              </Paragraph>
            </div>
          </div>

          {/* 第二段 */}
          <div className="notice-section" style={{
            marginBottom: '20px',
            padding: '16px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            borderLeft: '4px solid #52c41a'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Paragraph style={{
                fontSize: '1.1rem',
                margin: '0',
                lineHeight: '1.6',
                color: '#333'
              }}>
                請您盡可能地將自己帶入情境，想像這是您本人正在與聊天機器人進行溝通與互動。這樣的代入有助於我們了解您對該互動的真實感受，並進行後續的問卷填寫。
              </Paragraph>
            </div>
          </div>

          {/* 第三段 */}
          <div className="notice-section" style={{
            marginBottom: '25px',
            padding: '16px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            borderLeft: '4px solid #fa8c16'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Paragraph style={{
                fontSize: '1.1rem',
                margin: '0',
                lineHeight: '1.6',
                color: '#333'
              }}>
                請專心觀看影片，觀看完畢後會立即進行相關問卷調查。
              </Paragraph>
            </div>
          </div>

          <Divider style={{ margin: '20px 0' }} />

          {/* 結尾 */}
          <Paragraph style={{
            fontSize: '1.1rem',
            margin: '0',
            textAlign: 'center',
            color: '#666'
          }}>
            點擊「我已了解」開始觀看影片。感謝您的配合！
          </Paragraph>
        </div>
      </Modal>

      <Title level={2} className="text-center mb-6">觀看影片</Title>
      <Paragraph className="text-center mb-6" style={{ fontSize: '1.125rem' }}>
        請觀看以下關於聊天機器人互動的影片，並想像您是影片中的使用者。
      </Paragraph>
      <div className="video-container">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ" // 替換為實際視頻鏈接
          title="聊天機器人互動影片"
          className="video-iframe"
          allowFullScreen
        ></iframe>
      </div>
      <div className="text-center">
        <Paragraph className="mb-6" style={{ fontSize: '1.125rem' }}>
          觀看完影片後，請完成一份簡短的問卷調查，分享您的感受和反饋。
        </Paragraph>
        <div className="button-container">
          <Button
            type="primary"
            size="large"
            onClick={onContinue}
            icon={<FormOutlined />}
            className="rounded-button large-button"
            disabled={countdown > 0}
          >
            {countdown > 0 ? `前往問卷調查 (${countdown})` : '前往問卷調查'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VideoPage;