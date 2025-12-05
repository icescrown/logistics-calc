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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv = __importStar(require("dotenv"));
const db_1 = __importDefault(require("./utils/db"));
const warehouse_1 = __importDefault(require("./routes/warehouse"));
const carrier_1 = __importDefault(require("./routes/carrier"));
const logisticsMethod_1 = __importDefault(require("./routes/logisticsMethod"));
const region_1 = __importDefault(require("./routes/region"));
const quotation_1 = __importDefault(require("./routes/quotation"));
const calculation_1 = __importDefault(require("./routes/calculation"));
const postalCode_1 = __importDefault(require("./routes/postalCode"));
// 导入并初始化模型关联
require("./models/associations");
// 加载环境变量
dotenv.config({ path: '../.env' });
// 创建Express应用
const app = (0, express_1.default)();
// 中间件配置
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 路由配置
app.use('/api/warehouse', warehouse_1.default);
app.use('/api/carrier', carrier_1.default);
app.use('/api/logistics-method', logisticsMethod_1.default);
app.use('/api/region', region_1.default);
app.use('/api/quotation', quotation_1.default);
app.use('/api/calculation', calculation_1.default);
app.use('/api/postalCode', postalCode_1.default);
// 健康检查路由
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Logistics API is running' });
});
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
});
// 启动服务器
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // 仅测试数据库连接，不执行完整初始化
        await db_1.default.authenticate();
        console.log('数据库连接成功');
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=app.js.map