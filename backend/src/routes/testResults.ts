import express, { Request, Response, NextFunction } from 'express';
import TestResult from '../models/TestResult';

const router = express.Router();

// POST /api/test-results - 儲存測試結果
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📥 收到測試結果儲存請求');
        console.log('📊 請求資料:', JSON.stringify(req.body, null, 2));
        
        const {
            userId,
            testDate,
            results,
            analysis,
            surveyResponses,
            deviceInfo
        } = req.body;

        // 資料驗證
        if (!userId) {
            res.status(400).json({
                success: false,
                message: '缺少用戶 ID'
            });
            return;
        }

        if (!results || !analysis) {
            res.status(400).json({
                success: false,
                message: '缺少必要的測試資料'
            });
            return;
        }

        // 建立新的測試結果記錄
        const newTestResult = new TestResult({
            userId,
            testDate: testDate ? new Date(testDate) : new Date(),
            results: {
                maleComputer: results.maleComputer || [],
                femaleSkincare: results.femaleSkincare || [],
                femaleComputer: results.femaleComputer || [],
                maleSkincare: results.maleSkincare || []
            },
            analysis: {
                dScore: analysis.dScore || 0,
                biasType: analysis.biasType || null,
                biasLevel: analysis.biasLevel || '',
                biasDirection: analysis.biasDirection || '',
                d1Score: analysis.d1Score || 0,
                d2Score: analysis.d2Score || 0,
                d3Score: analysis.d3Score || 0,
                d4Score: analysis.d4Score || 0
            },
            surveyResponses: surveyResponses || {},
            deviceInfo: deviceInfo || {}
        });

        console.log('💾 正在儲存到 MongoDB...');
        const savedResult = await newTestResult.save();
        console.log('✅ 儲存成功:', savedResult._id);

        res.status(201).json({
            success: true,
            message: '測試結果儲存成功',
            data: {
                id: savedResult._id,
                userId: savedResult.userId,
                testDate: savedResult.testDate,
                createdAt: savedResult.createdAt
            }
        });

    } catch (error: any) {
        console.error('❌ 儲存測試結果錯誤:', error);
        
        // MongoDB 重複鍵錯誤
        if (error.code === 11000) {
            res.status(409).json({
                success: false,
                message: '重複的測試記錄',
                error: 'DUPLICATE_ENTRY'
            });
            return;
        }
        
        // MongoDB 驗證錯誤
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: '資料驗證失敗',
                error: error.message,
                details: error.errors
            });
            return;
        }
        
        // 其他錯誤
        res.status(500).json({
            success: false,
            message: '伺服器內部錯誤',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_SERVER_ERROR'
        });
    }
});

// GET /api/test-results - 取得測試結果列表（管理用途）
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, userId } = req.query;
        
        const filter: any = {};
        if (userId) {
            filter.userId = userId;
        }
        
        const skip = (Number(page) - 1) * Number(limit);
        
        const results = await TestResult.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('-surveyResponses -deviceInfo'); // 不返回敏感資料
        
        const total = await TestResult.countDocuments(filter);
        
        res.json({
            success: true,
            data: results,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
        
    } catch (error: any) {
        console.error('❌ 取得測試結果錯誤:', error);
        res.status(500).json({
            success: false,
            message: '伺服器內部錯誤',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_SERVER_ERROR'
        });
    }
});

// GET /api/test-results/:id - 取得特定測試結果
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const result = await TestResult.findById(id);
        
        if (!result) {
            res.status(404).json({
                success: false,
                message: '找不到指定的測試結果'
            });
            return;
        }
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error: any) {
        console.error('❌ 取得測試結果錯誤:', error);
        res.status(500).json({
            success: false,
            message: '伺服器內部錯誤',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_SERVER_ERROR'
        });
    }
});

export default router;