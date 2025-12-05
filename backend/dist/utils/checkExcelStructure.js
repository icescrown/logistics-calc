"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
// 检查Excel文件结构的脚本
const checkExcelStructure = () => {
    try {
        // 读取Excel文件
        const excelPath = path_1.default.join(__dirname, '../../..', '英国仓 20251110 P价 8.8折 谷仓英国尾程物流报价.xlsx');
        console.log(`读取Excel文件: ${excelPath}`);
        const workbook = XLSX.readFile(excelPath);
        // 打印所有工作表名称
        console.log('工作表名称:', workbook.SheetNames);
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
            console.error('无法获取工作表');
            process.exit(1);
        }
        // 将Excel数据转换为JSON格式（只读取前10行）
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`\n总数据行数: ${jsonData.length}`);
        console.log('\n前10行数据:');
        // 打印前10行数据
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            console.log(`第 ${i + 1} 行:`, row);
            if (row && Array.isArray(row)) {
                console.log(`   列数: ${row.length}`);
                console.log(`   列值: ${row.map((col, idx) => `[${idx}]${col}`).join(', ')}`);
            }
        }
        // 打印列数
        if (jsonData.length > 0 && Array.isArray(jsonData[0])) {
            console.log(`\n第一行列数: ${jsonData[0].length}`);
        }
    }
    catch (error) {
        console.error('检查Excel结构失败:', error);
        process.exit(1);
    }
};
// 执行检查
checkExcelStructure();
//# sourceMappingURL=checkExcelStructure.js.map