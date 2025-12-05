<template>
  <div class="calculation-container">
    <h2 class="page-title">物流方案计算</h2>
    
    <!-- 计算表单 -->
    <el-card class="calculation-form-card">
      <el-form
        ref="calculationFormRef"
        :model="calculationForm"
        :rules="calculationRules"
        class="calculation-form"
        label-width="120px"
      >
        <!-- 两列布局容器 -->
        <div class="two-column-layout">
          <!-- 左侧：货物信息 -->
          <div class="left-column">
            <h3 class="section-title">货物信息</h3>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="发出仓库" prop="warehouse_id">
                  <el-select
                    v-model="calculationForm.warehouse_id"
                    placeholder="请选择发出仓库"
                    clearable
                  >
                    <el-option
                      v-for="warehouse in warehouses"
                      :key="warehouse.id"
                      :label="warehouse.name"
                      :value="warehouse.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="货物重量(kg)" prop="weight">
                  <el-input
                    v-model.number="calculationForm.weight"
                    placeholder="请输入货物重量"
                    type="number"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="货物体积(m³)" prop="volume">
                  <el-input
                    v-model.number="calculationForm.volume"
                    placeholder="请输入货物体积"
                    type="number"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="保险需求">
                  <el-switch
                    v-model="calculationForm.insurance_needed"
                    active-text="需要"
                    inactive-text="不需要"
                  ></el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="货物价值(元)" prop="declared_value">
                  <el-input
                    v-model.number="calculationForm.declared_value"
                    placeholder="请输入货物价值"
                    type="number"
                    clearable
                    :disabled="!calculationForm.insurance_needed"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <!-- 右侧：地址信息 -->
          <div class="right-column">
            <h3 class="section-title">地址信息</h3>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="收件国家" prop="country">
                  <el-select
                    v-model="calculationForm.country"
                    placeholder="请选择收件国家"
                    clearable
                    filterable
                    :loading="loadingCountries"
                  >
                    <el-option
                      v-for="country in countries"
                      :key="country.id"
                      :label="`${country.iso_code} ${country.name}`"
                      :value="country.name"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="省份/州" prop="province">
                  <el-input
                    v-model="calculationForm.province"
                    placeholder="请输入省份/州"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="城市" prop="city">
                  <el-input
                    v-model="calculationForm.city"
                    placeholder="请输入城市"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="街道" prop="street">
                  <el-input
                    v-model="calculationForm.street"
                    placeholder="请输入街道"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="详细地址" prop="detail_address">
                  <el-input
                    v-model="calculationForm.detail_address"
                    placeholder="请输入详细地址"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="邮编" prop="postal_code">
                  <el-input
                    v-model="calculationForm.postal_code"
                    placeholder="请输入邮编"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        <el-form-item>
          <el-button
            type="primary"
            :loading="calculating"
            @click="handleCalculate"
            size="large"
          >
            <el-icon><Document /></el-icon>
            计算物流方案
          </el-button>
          <el-button
            @click="resetForm"
            size="large"
          >
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 计算结果 -->
    <el-card class="result-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>计算结果</span>
          <el-button
            type="text"
            @click="exportResult"
            :disabled="logisticsPlans.length === 0"
          >
            <el-icon><Download /></el-icon>
            导出结果
          </el-button>
        </div>
      </template>
      
      <!-- 未匹配到物流方案提示 -->
      <div v-if="logisticsPlans.length === 0" class="no-plan-tip">
        <el-empty
          description="未匹配到物流方案"
        >
          <el-button type="primary" @click="resetForm">重新计算</el-button>
        </el-empty>
      </div>
      
      <!-- 有匹配结果时显示 -->
      <div v-else>
        <!-- 推荐方案 -->
        <div class="recommended-plan" v-if="recommendedPlan">
          <h3>推荐方案</h3>
          <el-card shadow="hover" class="recommended-plan-card">
            <div class="plan-header">
              <div class="plan-info">
                <h4>{{ recommendedPlan.carrier.name }} - {{ recommendedPlan.logistics_method.name }}</h4>
                <p>目的地：{{ recommendedPlan.region.name }}</p>
              </div>
              <div class="plan-price">
                <span class="total-price">¥{{ recommendedPlan.total_price.toFixed(2) }}</span>
                <el-button
                  type="primary"
                  size="small"
                  @click="showPriceDetail(recommendedPlan)"
                >
                  查看明细
                </el-button>
              </div>
            </div>
            <div class="plan-details">
              <el-descriptions :column="3" border>
                <el-descriptions-item label="基础价格">¥{{ recommendedPlan.base_price.toFixed(2) }}</el-descriptions-item>
                <el-descriptions-item label="折扣">{{ (recommendedPlan.discount * 100).toFixed(0) }}%</el-descriptions-item>
                <el-descriptions-item label="折扣后价格">¥{{ (recommendedPlan.base_price * recommendedPlan.discount).toFixed(2) }}</el-descriptions-item>
                <el-descriptions-item label="货物重量">{{ recommendedPlan.weight }} kg</el-descriptions-item>
                <el-descriptions-item label="货物体积">{{ recommendedPlan.volume }} m³</el-descriptions-item>
                <el-descriptions-item label="保险需求">{{ recommendedPlan.insurance_needed ? '需要' : '不需要' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </div>
        
        <!-- 方案列表 -->
        <div class="plan-list" style="margin-top: 20px;">
          <h3>所有方案</h3>
          <el-table
            :data="logisticsPlans"
            style="width: 100%"
            border
            stripe
          >
            <el-table-column prop="carrier.name" label="承运商" width="150"></el-table-column>
            <el-table-column prop="logistics_method.name" label="物流方式" width="150"></el-table-column>
            <el-table-column prop="region.name" label="区域" width="150"></el-table-column>
            <el-table-column prop="base_price" label="基础价格" width="100">
              <template #default="scope">¥{{ scope.row.base_price.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="discount" label="折扣" width="100">
              <template #default="scope">{{ (scope.row.discount * 100).toFixed(0) }}%</template>
            </el-table-column>
            <el-table-column prop="total_price" label="总价格" width="120" sortable>
              <template #default="scope">
                <span class="price-text">¥{{ scope.row.total_price.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="重量范围" width="150">
              <template #default="scope">{{ scope.row.weight_from }} - {{ scope.row.weight_to }} kg</template>
            </el-table-column>
            <el-table-column prop="volume" label="体积范围" width="150">
              <template #default="scope">{{ scope.row.volume_from }} - {{ scope.row.volume_to }} m³</template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="showPriceDetail(scope.row)"
                >
                  查看明细
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
    
    <!-- 价格明细弹窗 -->
    <el-dialog
      v-model="priceDetailVisible"
      title="价格明细"
      width="600px"
    >
      <div class="price-detail" v-if="selectedPlan">
        <h4>{{ selectedPlan.carrier.name }} - {{ selectedPlan.logistics_method.name }}</h4>
        <p>目的地：{{ selectedPlan.region.name }}</p>
        <el-divider></el-divider>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="基础价格">¥{{ selectedPlan.base_price.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="折扣">{{ (selectedPlan.discount * 100).toFixed(0) }}%</el-descriptions-item>
          <el-descriptions-item label="折扣后价格" :span="2">¥{{ (selectedPlan.base_price * selectedPlan.discount).toFixed(2) }}</el-descriptions-item>
        </el-descriptions>
        
        <h5 style="margin-top: 20px;">附加费用</h5>
        <el-table
          :data="selectedPlan.additional_fees"
          style="width: 100%"
          border
          size="small"
        >
          <el-table-column prop="name" label="费用名称" width="150"></el-table-column>
          <el-table-column prop="type" label="费用类型" width="120"></el-table-column>
          <el-table-column prop="calculation_method" label="计算方式" width="120"></el-table-column>
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="scope">¥{{ scope.row.amount.toFixed(2) }}</template>
          </el-table-column>
        </el-table>
        
        <el-divider></el-divider>
        
        <div class="total-price-section">
          <span class="total-label">总价格：</span>
          <span class="total-amount">¥{{ selectedPlan.total_price.toFixed(2) }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="priceDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import api from '../../api';
import { ElMessage } from 'element-plus';
import { RefreshRight, Download } from '@element-plus/icons-vue';

// 表单引用
const calculationFormRef = ref();

// 计算状态
const calculating = ref(false);

// 价格明细弹窗
const priceDetailVisible = ref(false);
const selectedPlan = ref<any>(null);

// 计算表单数据
const calculationForm = reactive({
  warehouse_id: '',
  weight: '',
  volume: '',
  insurance_needed: false,
  declared_value: '',
  // 地址信息
  country: '',
  province: '',
  city: '',
  street: '',
  detail_address: '',
  postal_code: '',
});

// 表单验证规则
const calculationRules = {
  warehouse_id: [
    { required: true, message: '请选择发出仓库', trigger: 'change' },
  ],
  weight: [
    { required: true, message: '请输入货物重量', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '货物重量必须大于0', trigger: 'blur' },
  ],
  volume: [
    { required: true, message: '请输入货物体积', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '货物体积必须大于0', trigger: 'blur' },
  ],
  country: [
    { required: true, message: '请输入收件国家', trigger: 'blur' },
  ],
  city: [
    { required: true, message: '请输入城市', trigger: 'blur' },
  ],
  postal_code: [
    { required: true, message: '请输入邮编', trigger: 'blur' },
  ],
  declared_value: [
    {
      required: calculationForm.insurance_needed,
      message: '请输入货物价值',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      message: '货物价值必须大于等于0',
      trigger: 'blur',
    },
  ],
};

// 仓库列表
const warehouses = ref<any[]>([]);
// 国家列表
const countries = ref<any[]>([]);
// 国家加载状态
const loadingCountries = ref(false);
// 物流方案列表
const logisticsPlans = ref<any[]>([]);
// 推荐方案
const recommendedPlan = ref<any>(null);

// 获取基础数据
const getBaseData = async () => {
  try {
    // 获取仓库列表
    const warehouseData = await api.get('/warehouse', { params: { page: 1, page_size: 100 } });
    warehouses.value = Array.isArray(warehouseData.list) ? warehouseData.list : [];
    
    // 获取国家列表
    loadingCountries.value = true;
    const countryData = await api.get('/region/countries/all');
    countries.value = Array.isArray(countryData) ? countryData : [];
  } catch (error: any) {
    console.error('获取基础数据失败:', error);
    ElMessage.error('获取基础数据失败: ' + (error.response?.data?.message || error.message || '未知错误'));
  } finally {
    loadingCountries.value = false;
  }
};

// 计算物流方案
const handleCalculate = async () => {
  if (!calculationFormRef.value) return;
  
  try {
    await calculationFormRef.value.validate();
    calculating.value = true;
    
    // 清除之前的计算结果
    logisticsPlans.value = [];
    recommendedPlan.value = null;
    
    // 调用API计算物流方案
    const result = await api.post('/calculation/calculate', calculationForm) as any;
    // 注意：响应拦截器已经处理了data字段，直接访问result中的数据
    logisticsPlans.value = result?.logistics_plans || [];
    recommendedPlan.value = result?.recommended_plan || null;
    
    // 检查响应中是否包含错误信息
    if (result?.error) {
      // 显示错误提示
      ElMessage.error(result.error);
    } else if (logisticsPlans.value.length > 0) {
      // 只在计算成功且有物流方案时显示成功提示
      ElMessage.success('物流方案计算成功');
    }
  } catch (error: any) {
    // 计算失败时清除计算结果
    logisticsPlans.value = [];
    recommendedPlan.value = null;
    
    // 不再显示错误提示，由响应拦截器统一处理
    // 只需要确保计算结果被清除即可
  } finally {
    calculating.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (calculationFormRef.value) {
    calculationFormRef.value.resetFields();
  }
  logisticsPlans.value = [];
  recommendedPlan.value = null;
};

// 显示价格明细
const showPriceDetail = (plan: any) => {
  selectedPlan.value = plan;
  priceDetailVisible.value = true;
};

// 自动从地址中提取邮编
const extractPostalCode = (address: string) => {
  // 匹配常见邮编格式，支持数字和字母组合
  const postalCodeRegex = /\b[A-Z0-9]{3,10}\b/g;
  const match = address.match(postalCodeRegex);
  if (match && match.length > 0) {
    calculationForm.postal_code = match[0];
  }
};

// 监听地址变化，自动提取邮编
watch(
  () => calculationForm.address,
  (newAddress) => {
    extractPostalCode(newAddress);
  }
);

// 导出结果
const exportResult = () => {
  ElMessage.info('导出功能开发中');
};

// 初始化
onMounted(() => {
  getBaseData();
});
</script>

<style scoped>
.calculation-container {
  width: 100%;
  height: 100%;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.calculation-form-card {
  margin-bottom: 20px;
}

.calculation-form {
  margin-top: 20px;
}

/* 两列布局样式 */
.two-column-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.left-column, .right-column {
  flex: 1;
  min-width: 300px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.result-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommended-plan {
  margin-bottom: 20px;
}

.recommended-plan-card {
  margin-top: 10px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.plan-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.plan-info p {
  margin: 5px 0 0 0;
  color: #606266;
}

.plan-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.plan-details {
  margin-top: 15px;
}

.plan-list {
  margin-top: 20px;
}

.price-text {
  font-weight: bold;
  color: #f56c6c;
}

.price-detail h4 {
  margin: 0 0 5px 0;
}

.price-detail p {
  margin: 0 0 20px 0;
  color: #606266;
}

.total-price-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  font-size: 18px;
}

.total-label {
  font-weight: bold;
  margin-right: 10px;
}

.total-amount {
  font-weight: bold;
  color: #f56c6c;
  font-size: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .two-column-layout {
    flex-direction: column;
  }
  
  .left-column, .right-column {
    min-width: auto;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .el-form-item__label {
    font-size: 14px;
  }
}
</style>