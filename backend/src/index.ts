import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import testResultRoutes from './routes/testResults';

// 環境設定
dotenv.config();

// 創建 Express 應用
const app = express();

// 中間件
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gender-bias-test-frontend.onrender.com'] // 替換為你的前端 URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB 連接
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://f113156124:5sxaxnkpcVXdfCbw@huihui0.ps2xz32.mongodb.net/gender-bias-test?retryWrites=true&w=majority&appName=huihui0';

// 連接 MongoDB 並處理連接事件
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 監聽 MongoDB 連接事件
mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB 已連接');
  // 連接成功後安全地取得資料庫名稱
  const dbName = mongoose.connection.db?.databaseName;
  if (dbName) {
    console.log(`📊 連接到資料庫: ${dbName}`);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB 連接已斷開');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 連接錯誤:', err);
});

// 註冊路由
app.use('/api/test-results', testResultRoutes);

// 基本路由
app.get('/api', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? '已連接' : '未連接';
  res.json({
    message: '性別與商品偏見測試 API 正常運作中',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    databaseName: mongoose.connection.db?.databaseName || '未知'
  });
});

// 健康檢查路由
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const dbName = mongoose.connection.db?.databaseName || '未知';
  
  res.json({
    status: 'OK',
    database: isConnected ? '正常' : '異常',
    databaseName: dbName,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  });
});

// 錯誤處理中間件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ 伺服器錯誤:', err);
  res.status(500).json({
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '伺服器錯誤'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    message: '找不到請求的資源',
    path: req.originalUrl
  });
});

// 啟動函數
const startServer = async () => {
  try {
    // 先連接資料庫
    await connectDB();
    
    // 再啟動伺服器
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
      console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 啟動伺服器失敗:', error);
    process.exit(1);
  }
};

// 優雅關閉處理
process.on('SIGINT', async () => {
  console.log('\n🛑 收到 SIGINT 信號，正在關閉伺服器...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB 連接已關閉');
    process.exit(0);
  } catch (error) {
    console.error('❌ 關閉過程中發生錯誤:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 收到 SIGTERM 信號，正在關閉伺服器...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB 連接已關閉');
    process.exit(0);
  } catch (error) {
    console.error('❌ 關閉過程中發生錯誤:', error);
    process.exit(1);
  }
});

// 啟動伺服器
startServer();