// backend/src/models/TestResult.ts
import mongoose, { Schema, Document } from 'mongoose';

// 定義介面
interface ITestResult extends Document {
  userId: string;
  testDate: Date;
  completionTime?: number;
  results: {
    maleComputer: number[];
    femaleSkincare: number[];
    femaleComputer: number[];
    maleSkincare: number[];
  };
  analysis: {
    dScore: number;
    biasType: string | null;
    biasLevel: string;
    biasDirection?: string;
    d1Score?: number;
    d2Score?: number;
    d3Score?: number;
    d4Score?: number;
  };
  surveyResponses?: Map<string, any>;
  demographics?: {
    age?: number;
    gender?: string;
    education?: string;
    occupation?: string;
  };
  deviceInfo?: {
    browser?: string;
    language?: string;
    screenSize?: string;
    timezone?: string;
    platform?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 定義 Schema
const testResultSchema = new Schema<ITestResult>({
  // 用戶識別 (匿名ID)
  userId: {
    type: String,
    required: [true, '用戶 ID 是必需的'],
    index: true
  },
  
  // 測試時間
  testDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 測試完成時間（毫秒）
  completionTime: {
    type: Number,
    min: [0, '完成時間不能為負數']
  },
  
  // 原始測試結果數據
  results: {
    maleComputer: {
      type: [Number],
      required: true,
      validate: {
        validator: function(arr: number[]) {
          return arr.every(time => time > 0 && time < 30000); // 0-30秒
        },
        message: '反應時間必須在 0-30000 毫秒之間'
      }
    },
    femaleSkincare: {
      type: [Number],
      required: true,
      validate: {
        validator: function(arr: number[]) {
          return arr.every(time => time > 0 && time < 30000);
        },
        message: '反應時間必須在 0-30000 毫秒之間'
      }
    },
    femaleComputer: {
      type: [Number],
      required: true,
      validate: {
        validator: function(arr: number[]) {
          return arr.every(time => time > 0 && time < 30000);
        },
        message: '反應時間必須在 0-30000 毫秒之間'
      }
    },
    maleSkincare: {
      type: [Number],
      required: true,
      validate: {
        validator: function(arr: number[]) {
          return arr.every(time => time > 0 && time < 30000);
        },
        message: '反應時間必須在 0-30000 毫秒之間'
      }
    }
  },
  
  // 分析結果
  analysis: {
    dScore: {
      type: Number,
      required: true,
      min: [-3, 'D分數不能小於 -3'],
      max: [3, 'D分數不能大於 3']
    },
    biasType: {
      type: String,
      enum: ['gender_tech', 'gender_skincare', null],
      default: null
    },
    biasLevel: {
      type: String,
      required: true,
      enum: ['無或極弱偏見', '輕度偏見', '中度偏見', '高度偏見']
    },
    biasDirection: String,
    d1Score: Number,
    d2Score: Number,
    d3Score: Number,
    d4Score: Number
  },
  
  // 問卷回答
  surveyResponses: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  },
  
  // 用戶基本資訊（選填）
  demographics: {
    age: {
      type: Number,
      min: [10, '年齡不能小於 10'],
      max: [120, '年齡不能大於 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    education: {
      type: String,
      enum: ['elementary', 'middle_school', 'high_school', 'bachelor', 'master', 'phd', 'other']
    },
    occupation: String
  },
  
  // 用戶裝置資訊
  deviceInfo: {
    browser: String,
    language: String,
    screenSize: String,
    timezone: String,
    platform: String
  }
}, 
{
  timestamps: true, // 自動添加 createdAt 和 updatedAt
  versionKey: false // 移除 __v 欄位
});

// 建立索引以提升查詢性能
testResultSchema.index({ userId: 1, testDate: -1 });
testResultSchema.index({ createdAt: -1 });
testResultSchema.index({ 'analysis.biasLevel': 1 });
testResultSchema.index({ 'analysis.biasType': 1 });

// 虛擬屬性：計算測試總時長（如果有完成時間）
testResultSchema.virtual('testDuration').get(function() {
  if (this.completionTime) {
    return `${Math.round(this.completionTime / 1000)} 秒`;
  }
  return '未知';
});

// 實例方法：獲取統計摘要
testResultSchema.methods.getStatsSummary = function() {
  const allTimes = [
    ...this.results.maleComputer,
    ...this.results.femaleSkincare,
    ...this.results.femaleComputer,
    ...this.results.maleSkincare
  ];
  
  if (allTimes.length === 0) return null;
  
  return {
    totalTrials: allTimes.length,
    averageReactionTime: Math.round(allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length),
    minReactionTime: Math.min(...allTimes),
    maxReactionTime: Math.max(...allTimes),
    biasLevel: this.analysis.biasLevel,
    dScore: this.analysis.dScore.toFixed(3)
  };
};

// 靜態方法：獲取偏見分布統計
testResultSchema.statics.getBiasDistribution = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$analysis.biasLevel',
        count: { $sum: 1 },
        avgDScore: { $avg: '$analysis.dScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// 中間件：儲存前的資料處理
testResultSchema.pre('save', function(next) {
  // 確保測試時間不超過當前時間
  if (this.testDate > new Date()) {
    this.testDate = new Date();
  }
  next();
});

export default mongoose.model<ITestResult>('TestResult', testResultSchema);