<template>
  <div class="quotation-container">
    <h2 class="page-title">报价配置</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        @click="showAddDialog"
      >
        <el-icon><Plus /></el-icon>
        新增报价
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="请输入报价相关信息"
        clearable
        style="width: 300px; margin-left: 20px;"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 报价列表 -->
    <el-card class="quotation-list-card">
      <el-table
        :data="quotations"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="carrier.name" label="承运商" width="120"></el-table-column>
        <el-table-column prop="logistics_method.name" label="物流方式" width="150"></el-table-column>
        <el-table-column prop="region.name" label="区域" width="120"></el-table-column>
        <el-table-column label="重量范围" width="180">
          <template #default="scope">
            <!-- 使用正确的别名quotation_weight_ranges，并添加fallback -->
            <template v-if="(scope.row.quotation_weight_ranges || scope.row.weightRanges || scope.row.weight_ranges) && (scope.row.quotation_weight_ranges || scope.row.weightRanges || scope.row.weight_ranges).length > 0">
              <div v-for="(range, index) in (scope.row.quotation_weight_ranges || scope.row.weightRanges || scope.row.weight_ranges)" :key="index">
                {{ range.weight_from }} - {{ range.weight_to }} kg
              </div>
            </template>
            <template v-else>
              暂无数据
            </template>
          </template>
        </el-table-column>
        <el-table-column label="基础价格" width="120" sortable>
          <template #default="scope">
            <!-- 使用正确的别名quotation_weight_ranges，并添加fallback -->
            <template v-if="(scope.row.quotation_weight_ranges || scope.row.weightRanges || scope.row.weight_ranges) && (scope.row.quotation_weight_ranges || scope.row.weightRanges || scope.row.weight_ranges).length > 0">
              <div v-for="(range, index) in (scope.row.quotation_weight_ranges || scope.row.weightRanges || scope.row.weight_ranges)" :key="index">
                ¥{{ range.base_price }}
              </div>
            </template>
            <template v-else>
              暂无数据
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="discount" label="折扣" width="100" sortable>
          <template #default="scope">
            {{ (scope.row.discount * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="200">
          <template #default="scope">
            {{ formatDate(scope.row.effective_date) }} 至 {{ scope.row.expire_date ? formatDate(scope.row.expire_date) : '永久' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="updateStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1200px"
    >
      <el-form
        ref="quotationFormRef"
        :model="quotationForm"
        :rules="quotationRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="承运商" prop="carrier_id">
              <el-select
                v-model="quotationForm.carrier_id"
                placeholder="请选择承运商"
                clearable
              >
                <el-option
                  v-for="carrier in carriers"
                  :key="carrier.id"
                  :label="carrier.name"
                  :value="carrier.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物流方式" prop="logistics_method_id">
              <el-select
                v-model="quotationForm.logistics_method_id"
                placeholder="请选择物流方式"
                clearable
              >
                <el-option
                  v-for="method in logisticsMethods"
                  :key="method.id"
                  :label="method.name"
                  :value="method.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="区域" prop="region_id">
              <el-select
                v-model="quotationForm.region_id"
                placeholder="请选择区域"
                clearable
              >
                <el-option
                  v-for="region in regions"
                  :key="region.id"
                  :label="region.name"
                  :value="region.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="折扣" prop="discount">
              <el-input
                v-model.number="quotationForm.discount"
                placeholder="请输入折扣（如0.95表示95折）"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 重量范围列表 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="重量范围">
              <div class="weight-range-container">
                <div class="weight-range-header">
                  <div class="weight-range-title">重量范围(Kg)</div>
                  <div class="weight-range-title">基础价格</div>
                  <div class="weight-range-title">续重(Kg)</div>
                  <div class="weight-range-title">续重价格</div>
                  <div class="weight-range-title">操作</div>
                </div>
                <div 
                  v-for="(range, index) in quotationForm.weight_ranges" 
                  :key="index"
                  class="weight-range-row"
                >
                  <div class="weight-range-item">
                    <el-input
                      v-model.number="range.weight_from"
                      placeholder="起始重量"
                      size="small"
                      style="width: 80px; margin-right: 5px;"
                    ></el-input>
                    <span style="margin: 0 5px;"><</span>
                    <span>重量</span>
                    <span style="margin: 0 5px;">≤</span>
                    <el-input
                      v-model.number="range.weight_to"
                      placeholder="结束重量"
                      size="small"
                      style="width: 80px; margin-left: 5px;"
                    ></el-input>
                  </div>
                  <div class="weight-range-item">
                    <el-input
                      v-model.number="range.base_price"
                      placeholder="基础价格"
                      size="small"
                      style="width: 120px;"
                    ></el-input>
                  </div>
                  <div class="weight-range-item">
                    <el-input
                      v-model.number="range.additional_weight"
                      placeholder="续重"
                      size="small"
                      style="width: 80px;"
                    ></el-input>
                  </div>
                  <div class="weight-range-item">
                    <el-input
                      v-model.number="range.additional_weight_price"
                      placeholder="续重价格"
                      size="small"
                      style="width: 120px;"
                    ></el-input>
                  </div>
                  <div class="weight-range-item">
                    <el-button
                      type="danger"
                      size="small"
                      @click="removeWeightRange(index)"
                      :disabled="quotationForm.weight_ranges.length <= 1"
                    >
                      <el-icon><Delete /></el-icon>
                      移除
                    </el-button>
                    <el-button
                      type="primary"
                      size="small"
                      @click="insertWeightRange(index)"
                      style="margin-left: 5px;"
                    >
                      <el-icon><Plus /></el-icon>
                      插入
                    </el-button>
                  </div>
                </div>
                <el-button
                  type="success"
                  size="small"
                  @click="addWeightRange"
                  style="margin-top: 10px;"
                >
                  <el-icon><Plus /></el-icon>
                  新增一行
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="quotationForm.status"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effective_date">
              <el-date-picker
                v-model="quotationForm.effective_date"
                type="datetime"
                placeholder="请选择生效日期"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expire_date">
              <el-date-picker
                v-model="quotationForm.expire_date"
                type="datetime"
                placeholder="请选择失效日期（可选）"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import api from '../../api';
import { ElMessage } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';

// 报价列表数据
const quotations = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedQuotations = ref<any[]>([]);

// 基础数据列表
const carriers = ref<any[]>([]);
const logisticsMethods = ref<any[]>([]);
const regions = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('新增报价');
const submitting = ref(false);

// 表单引用
const quotationFormRef = ref();

// 表单数据
const quotationForm = reactive({
  id: '',
  carrier_id: '',
  logistics_method_id: '',
  region_id: '',
  weight_ranges: [
    {
      weight_from: 0,
      weight_to: 0,
      base_price: 0,
      additional_weight: 0,
      additional_weight_price: 0
    }
  ],
  discount: 1.00,
  effective_date: '',
  expire_date: '',
  status: 1,
});

// 表单验证规则
const quotationRules = {
  carrier_id: [
    { required: true, message: '请选择承运商', trigger: 'blur' },
  ],
  logistics_method_id: [
    { required: true, message: '请选择物流方式', trigger: 'blur' },
  ],
  region_id: [
    { required: true, message: '请选择区域', trigger: 'blur' },
  ],
  // 重量范围验证将在提交时进行，这里移除旧的验证规则
  // base_price验证已移至重量范围验证中
  discount: [
    { required: true, message: '请输入折扣', trigger: 'blur' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (typeof value !== 'number' || isNaN(value)) {
          callback(new Error('请输入有效的数字'));
        } else if (value < 0.01 || value > 1) {
          callback(new Error('折扣必须在0.01到1之间'));
        } else {
          callback();
        }
      },
      trigger: 'blur,change'
    },
  ],
  effective_date: [
    { required: true, message: '请选择生效日期', trigger: 'blur' },
  ],
};

// 获取报价列表
const getQuotations = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value,
    };
    const result = await api.get('/quotation', { params });
    quotations.value = Array.isArray(result.list) ? result.list : [];
    total.value = result.total || 0;
  } catch (error) {
    ElMessage.error('获取报价列表失败');
  }
};

// 获取基础数据列表
const getBaseData = async () => {
  try {
    // 获取承运商列表
    const carriersResult = await api.get('/carrier', { params: { page: 1, page_size: 100 } });
    carriers.value = Array.isArray(carriersResult.list) ? carriersResult.list : [];
    
    // 获取物流方式列表
    const methodsResult = await api.get('/logistics-method', { params: { page: 1, page_size: 100 } });
    logisticsMethods.value = Array.isArray(methodsResult.list) ? methodsResult.list : [];
    
    // 获取区域列表
    const regionsResult = await api.get('/region', { params: { page: 1, page_size: 100 } });
    regions.value = Array.isArray(regionsResult.list) ? regionsResult.list : [];
  } catch (error) {
    ElMessage.error('获取基础数据失败');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getQuotations();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getQuotations();
};

// 当前页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getQuotations();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedQuotations.value = selection;
};

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增报价';
  resetForm();
  dialogVisible.value = true;
};

// 显示编辑弹窗
const showEditDialog = (row: any) => {
  dialogTitle.value = '编辑报价';
  // 确保weight_ranges存在，注意使用正确的别名quotation_weight_ranges
  const weightRanges = row.quotation_weight_ranges || row.weightRanges || row.weight_ranges || [
    {
      weight_from: 0,
      weight_to: 0,
      base_price: 0,
      additional_weight: 0,
      additional_weight_price: 0
    }
  ];
  // 转换为前端需要的格式
  const formattedWeightRanges = weightRanges.map((range: any) => ({
    weight_from: range.weight_from || range.weightFrom || 0,
    weight_to: range.weight_to || range.weightTo || 0,
    base_price: range.base_price || range.basePrice || 0,
    additional_weight: range.additional_weight || range.additionalWeight || 0,
    additional_weight_price: range.additional_weight_price || range.additionalWeightPrice || 0
  }));
  // 复制基本信息，并确保discount为数字类型
  Object.assign(quotationForm, {
    ...row,
    weight_ranges: formattedWeightRanges,
    discount: parseFloat(row.discount) || 1.00
  });
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (quotationFormRef.value) {
    quotationFormRef.value.resetFields();
  }
  Object.assign(quotationForm, {
    id: '',
    carrier_id: '',
    logistics_method_id: '',
    region_id: '',
    weight_ranges: [
      {
        weight_from: 0,
        weight_to: 0,
        base_price: 0,
        additional_weight: 0,
        additional_weight_price: 0
      }
    ],
    discount: 1.00,
    effective_date: '',
    expire_date: '',
    status: 1,
  });
};

// 添加重量范围
const addWeightRange = () => {
  quotationForm.weight_ranges.push({
    weight_from: 0,
    weight_to: 0,
    base_price: 0,
    additional_weight: 0,
    additional_weight_price: 0
  });
};

// 移除重量范围
const removeWeightRange = (index: number) => {
  if (quotationForm.weight_ranges.length > 1) {
    quotationForm.weight_ranges.splice(index, 1);
  }
};

// 插入重量范围
const insertWeightRange = (index: number) => {
  quotationForm.weight_ranges.splice(index + 1, 0, {
    weight_from: 0,
    weight_to: 0,
    base_price: 0,
    additional_weight: 0,
    additional_weight_price: 0
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!quotationFormRef.value) return;
  
  // 验证重量范围
  for (const [index, range] of quotationForm.weight_ranges.entries()) {
    // 检查起始重量
    if (range.weight_from === undefined || range.weight_from === null || range.weight_from === '' || isNaN(Number(range.weight_from))) {
      ElMessage.error(`第 ${index + 1} 行：请输入有效的起始重量`);
      return;
    }
    // 检查结束重量
    if (range.weight_to === undefined || range.weight_to === null || range.weight_to === '' || isNaN(Number(range.weight_to))) {
      ElMessage.error(`第 ${index + 1} 行：请输入有效的结束重量`);
      return;
    }
    // 检查起始重量必须小于结束重量
    if (Number(range.weight_from) >= Number(range.weight_to)) {
      ElMessage.error(`第 ${index + 1} 行：起始重量必须小于结束重量`);
      return;
    }
    // 检查基础价格
    if (range.base_price === undefined || range.base_price === null || range.base_price === '' || isNaN(Number(range.base_price))) {
      ElMessage.error(`第 ${index + 1} 行：请输入有效的基础价格`);
      return;
    }
    // 检查续重
    if (range.additional_weight === undefined || range.additional_weight === null || range.additional_weight === '' || isNaN(Number(range.additional_weight)) || Number(range.additional_weight) < 0) {
      ElMessage.error(`第 ${index + 1} 行：请输入有效的续重（不能小于0）`);
      return;
    }
    // 检查续重价格
    if (range.additional_weight_price === undefined || range.additional_weight_price === null || range.additional_weight_price === '' || isNaN(Number(range.additional_weight_price)) || Number(range.additional_weight_price) < 0) {
      ElMessage.error(`第 ${index + 1} 行：请输入有效的续重价格（不能小于0）`);
      return;
    }
  }
  
  // 验证重量范围的连续性和非重叠性
  if (quotationForm.weight_ranges.length > 1) {
    // 对重量范围按照起始重量排序
    const sortedRanges = [...quotationForm.weight_ranges].sort((a, b) => a.weight_from - b.weight_from);
    
    // 检查是否有重叠
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const currentRange = sortedRanges[i];
      const nextRange = sortedRanges[i + 1];
      
      // 检查重叠
      if (nextRange.weight_from < currentRange.weight_to) {
        ElMessage.error(`重量范围重叠：第 ${i + 1} 行的结束重量(${currentRange.weight_to})大于第 ${i + 2} 行的起始重量(${nextRange.weight_from})`);
        return;
      }
      
      // 检查连续性（可选，允许有间隙但不允许重叠）
      // if (nextRange.weight_from !== currentRange.weight_to) {
      //   ElMessage.warning(`重量范围不连续：第 ${i + 1} 行的结束重量(${currentRange.weight_to})不等于第 ${i + 2} 行的起始重量(${nextRange.weight_from})`);
      // }
    }
  }
  
  try {
    await quotationFormRef.value.validate();
    submitting.value = true;
    
    // Debug: Log the data being sent
    console.log('Sending quotation data:', quotationForm);
    
    if (quotationForm.id) {
      // 编辑
      await api.put(`/quotation/${quotationForm.id}`, quotationForm);
      ElMessage.success('报价编辑成功');
    } else {
      // 新增
      await api.post('/quotation', quotationForm);
      ElMessage.success('报价新增成功');
    }
    
    dialogVisible.value = false;
    getQuotations();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await api.patch(`/quotation/${row.id}/status`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除报价
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/quotation/${id}`);
    ElMessage.success('报价删除成功');
    getQuotations();
  } catch (error) {
    ElMessage.error('报价删除失败');
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 初始化
onMounted(() => {
  getQuotations();
  getBaseData();
});
</script>

<style scoped>
.quotation-container {
  width: 100%;
  height: 100%;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.action-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quotation-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 重量范围列表样式 */
.weight-range-container {
  margin-top: 10px;
  width: 100%;
  overflow-x: auto;
}

.weight-range-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  width: 100%;
  min-width: 800px;
}

.weight-range-title {
  flex: 1;
  text-align: center;
  min-width: 120px;
  font-size: 14px;
}

.weight-range-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
  width: 100%;
  min-width: 800px;
  box-sizing: border-box;
}

.weight-range-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.weight-range-item:first-child {
  justify-content: flex-start;
  min-width: 250px;
}

.weight-range-item:last-child {
  justify-content: flex-end;
  min-width: 150px;
}
</style>