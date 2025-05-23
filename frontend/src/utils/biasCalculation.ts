import { TestResults } from '../types/testTypes';
import { maleWords, femaleWords, computerWords, skinCareWords } from '../constants/testConstants';

/**
 * 根據標準IAT D分數演算法計算偏見強度
 * @param testResults 測試結果數據
 * @returns D值和偏見強度級別
 */
export const calculateDScore = (testResults: TestResults) => {
    // 步驟 1: 資料前處理
    // 排除反應時間超過10秒的試驗
    const validMaleComputer = testResults.maleComputer.filter(time => time < 10000);
    const validFemaleSkincare = testResults.femaleSkincare.filter(time => time < 10000);
    const validFemaleComputer = testResults.femaleComputer.filter(time => time < 10000);
    const validMaleSkincare = testResults.maleSkincare.filter(time => time < 10000);

    // 步驟 2: 計算每個區組的平均反應時間
    const meanMaleComputer = validMaleComputer.length > 0
        ? validMaleComputer.reduce((sum, time) => sum + time, 0) / validMaleComputer.length
        : 0;

    const meanFemaleSkincare = validFemaleSkincare.length > 0
        ? validFemaleSkincare.reduce((sum, time) => sum + time, 0) / validFemaleSkincare.length
        : 0;

    const meanFemaleComputer = validFemaleComputer.length > 0
        ? validFemaleComputer.reduce((sum, time) => sum + time, 0) / validFemaleComputer.length
        : 0;

    const meanMaleSkincare = validMaleSkincare.length > 0
        ? validMaleSkincare.reduce((sum, time) => sum + time, 0) / validMaleSkincare.length
        : 0;

    // 步驟 3: 計算每對比較區組的合併標準差
    // 性別-電腦類聯想（男性+電腦類 vs 女性+電腦類）
    const genderComputerTimes = [...validMaleComputer, ...validFemaleComputer];
    const sdGenderComputer = calculateStandardDeviation(genderComputerTimes);

    // 性別-護膚類聯想（男性+護膚類 vs 女性+護膚類）
    const genderSkincareTimes = [...validMaleSkincare, ...validFemaleSkincare];
    const sdGenderSkincare = calculateStandardDeviation(genderSkincareTimes);

    // 男性-產品類別聯想（男性+電腦類 vs 男性+護膚類）
    const maleProductTimes = [...validMaleComputer, ...validMaleSkincare];
    const sdMaleProduct = calculateStandardDeviation(maleProductTimes);

    // 女性-產品類別聯想（女性+電腦類 vs 女性+護膚類）
    const femaleProductTimes = [...validFemaleComputer, ...validFemaleSkincare];
    const sdFemaleProduct = calculateStandardDeviation(femaleProductTimes);

    // 傳統與非傳統組合聯想（男性+電腦類,女性+護膚類 vs 女性+電腦類,男性+護膚類）
    const traditionalTimes = [...validMaleComputer, ...validFemaleSkincare];
    const nonTraditionalTimes = [...validFemaleComputer, ...validMaleSkincare];
    const allTimes = [...traditionalTimes, ...nonTraditionalTimes];
    const sdAll = calculateStandardDeviation(allTimes);

    // 計算平均反應時間
    const meanTraditional = (meanMaleComputer + meanFemaleSkincare) / 2;
    const meanNonTraditional = (meanFemaleComputer + meanMaleSkincare) / 2;

    // 步驟 4: 計算擴展BIAT的四個D分數
    // 性別-電腦類聯想：D1 = (女性+電腦類平均RT - 男性+電腦類平均RT) ÷ SD(男性+電腦類,女性+電腦類)
    const d1 = sdGenderComputer > 0 ? (meanFemaleComputer - meanMaleComputer) / sdGenderComputer : 0;

    // 性別-護膚類聯想：D2 = (男性+護膚類平均RT - 女性+護膚類平均RT) ÷ SD(男性+護膚類,女性+護膚類)
    const d2 = sdGenderSkincare > 0 ? (meanMaleSkincare - meanFemaleSkincare) / sdGenderSkincare : 0;

    // 男性-產品類別聯想：D3 = (男性+護膚類平均RT - 男性+電腦類平均RT) ÷ SD(男性+電腦類,男性+護膚類)
    const d3 = sdMaleProduct > 0 ? (meanMaleSkincare - meanMaleComputer) / sdMaleProduct : 0;

    // 女性-產品類別聯想：D4 = (女性+電腦類平均RT - 女性+護膚類平均RT) ÷ SD(女性+電腦類,女性+護膚類)
    const d4 = sdFemaleProduct > 0 ? (meanFemaleComputer - meanFemaleSkincare) / sdFemaleProduct : 0;

    // 綜合D分數：傳統組合與非傳統組合的對比
    // 正值：非傳統組合反應慢，傳統組合反應快（表示有刻板印象）
    // 負值：傳統組合反應慢，非傳統組合反應快（表示反向刻板印象）
    const dScore = sdAll > 0 ? (meanNonTraditional - meanTraditional) / sdAll : 0;

    // 步驟 5: 解讀D分數
    let biasLevel = '';
    let biasType = null;
    let biasDirection = '';

    // 根據IAT計算偏見方法_1.docx中的效應強度解釋
    const absDScore = Math.abs(dScore);
    
    if (absDScore < 0.15) {
        biasLevel = '無或極弱偏見';
        biasType = null;
        biasDirection = '無明顯偏向';
    } else {
        // 判斷具體的偏見類型
        // 比較女性+電腦 vs 男性+護膚，看哪個反應時間更長
        // 這樣可以確定偏見主要是針對哪種非傳統組合
        const femaleComputerBias = meanFemaleComputer - meanMaleComputer; // 女性使用電腦的偏見程度
        const maleSkincareBias = meanMaleSkincare - meanFemaleSkincare;   // 男性使用護膚的偏見程度
        
        // 偏見類型根據哪種非傳統組合反應時間差異更大來決定
        if (femaleComputerBias > maleSkincareBias && femaleComputerBias > 0) {
            biasType = 'gender_tech';  // 女性使用電腦類產品的偏見
        } else if (maleSkincareBias > femaleComputerBias && maleSkincareBias > 0) {
            biasType = 'gender_skincare';  // 男性使用護膚類產品的偏見
        } else if (dScore > 0) {
            // 如果兩種偏見差不多，根據綜合D分數判斷方向
            biasType = 'gender_tech';
        } else {
            biasType = 'gender_skincare';
        }
        
        // 設置偏見方向和程度
        biasDirection = dScore > 0 ? '傳統性別刻板印象' : '反向性別刻板印象';
        
        if (absDScore >= 0.65) {
            biasLevel = '高度偏見';
        } else if (absDScore >= 0.35) {
            biasLevel = '中度偏見';
        } else {
            biasLevel = '輕度偏見';
        }
    }

    return {
        dScore,
        d1, d2, d3, d4, // 額外返回四個分項D分數，用於更詳細的分析
        biasLevel,
        biasDirection,
        biasType,
        meanMaleComputer,
        meanFemaleSkincare,
        meanFemaleComputer,
        meanMaleSkincare,
        meanTraditional,
        meanNonTraditional,
        standardDeviation: sdAll
    };
};

/**
 * 計算標準差的輔助函數
 * @param values 數值數組
 * @returns 標準差
 */
function calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squareDiffs.reduce((sum, diff) => sum + diff, 0) / (values.length - 1);
    
    return Math.sqrt(variance);
}

/**
 * 產生全部具有偏見的產品列表，按偏見程度排序
 * @param biasType 偏見類型 (gender_skincare/gender_tech)
 * @param biasStrength 偏見強度
 * @returns 產品列表
 */
export const generateBiasedProducts = (biasType: string | null, biasStrength: number) => {
    if (!biasType || Math.abs(biasStrength) < 0.15) {
        return [];
    }

    // 強度係數 (用於排序)
    const strengthCoefficient = Math.min(Math.abs(biasStrength), 1);

    // 產品列表 - 使用測試中的實際產品
    const productWeights: {[key: string]: number} = {
        // 電腦類產品
        '電競滑鼠': 1.0,
        '機械鍵盤': 0.95,
        '曲面螢幕': 0.9,
        '顯示卡': 0.85,
        '水冷散熱器': 0.8,

        // 護膚類產品
        '面膜': 1.0,
        '精華液': 0.95,
        '保濕霜': 0.9,
        '眼霜': 0.85,
        '乳液': 0.8
    };

    // 根據偏見類型選擇要顯示的產品列表
    let products = [];

    if (biasType === 'gender_tech') {
        // 對女性使用電腦類產品有偏見，顯示電腦類產品
        products = computerWords.map(product => ({
            name: product,
            score: (productWeights[product] || 0.7) * strengthCoefficient
        }));
    } else { // biasType === 'gender_skincare'
        // 對男性使用護膚類產品有偏見，顯示護膚類產品
        products = skinCareWords.map(product => ({
            name: product,
            score: (productWeights[product] || 0.7) * strengthCoefficient
        }));
    }

    // 按分數降序排序
    return products.sort((a, b) => b.score - a.score);
};