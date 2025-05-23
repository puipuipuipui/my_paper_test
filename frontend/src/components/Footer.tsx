import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

function Footer() {
  return (
    <div className="bg-gray-800 text-white py-4 px-6 ">
      <div className="max-w-7xl mx-auto text-center">
        <Text className="text-gray-300">2025 性別與商品偏見研究項目</Text>
      </div>
    </div>
  );
};

export default Footer;