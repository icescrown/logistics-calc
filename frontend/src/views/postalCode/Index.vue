<template>
  <div class="postal-code-container">
    <h2 class="page-title">邮政编码管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        @click="showAddDialog"
      >
        <el-icon><Plus /></el-icon>
        新增邮政编码
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="请输入邮政编码或国家名称"
        clearable
        style="width: 300px; margin-left: 20px;"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 邮政编码列表 -->
    <el-card class="postal-code-list-card">
      <el-table
        :data="postalCodes"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="code" label="邮政编码" width="150"></el-table-column>
        <el-table-column label="所属国家" width="180">
          <template #default="scope">
            {{ scope.row.country?.name || '未关联' }}
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
      width="600px"
    >
      <el-form
        ref="postalCodeFormRef"
        :model="postalCodeForm"
        :rules="postalCodeRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="所属国家" prop="country_id">
              <el-select
                v-model="postalCodeForm.country_id"
                placeholder="请选择所属国家"
                clearable
                @change="handleCountryChange"
              >
                <el-option
                  v-for="country in countries"
                  :key="country.id"
                  :label="country.name"
                  :value="country.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="邮政编码" prop="code">
              <el-input
                v-model="postalCodeForm.code"
                placeholder="请输入邮政编码"
                clearable
                @blur="validatePostalCodeFormat"
              >
                <template #append>
                  <span class="postal-code-example" v-if="currentCountryCode">
                    示例: {{ postalCodeExample }}
                  </span>
                </template>
              </el-input>
              <div v-if="postalCodeValidationMessage" class="validation-message" :class="{ 'error': !isPostalCodeValid }">
                {{ postalCodeValidationMessage }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="postalCodeForm.status"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
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
            :disabled="!isPostalCodeValid"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import api from '../../api';
import { ElMessage } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { validatePostalCode, getPostalCodeExample } from '../../utils/postalCodeValidator';

// 邮政编码列表数据
const postalCodes = ref<any[]>([]);
const countries = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedPostalCodes = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('新增邮政编码');
const submitting = ref(false);

// 表单引用
const postalCodeFormRef = ref();

// 表单数据
const postalCodeForm = reactive({
  id: '',
  code: '',
  country_id: '',
  status: 1,
});

// 当前选中的国家代码
const currentCountryCode = ref('');

// 邮政编码验证状态
const isPostalCodeValid = ref(true);
const postalCodeValidationMessage = ref('');

// 计算当前国家的邮政编码示例
const postalCodeExample = computed(() => {
  return getPostalCodeExample(currentCountryCode.value);
});

// 表单验证规则
const postalCodeRules = {
  country_id: [
    { required: true, message: '请选择所属国家', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入邮政编码', trigger: 'blur' },
  ],
};

// 获取邮政编码列表
const getPostalCodes = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value,
    };
    const result = await api.get('/postalCode', { params });
    postalCodes.value = Array.isArray(result.list) ? result.list : [];
    total.value = result.total || 0;
  } catch (error) {
    ElMessage.error('获取邮政编码列表失败');
  }
};

// 获取所有国家
const getAllCountries = async () => {
  try {
    const result = await api.get('/region/countries/all');
    countries.value = Array.isArray(result) ? result : [];
  } catch (error) {
    ElMessage.error('获取国家列表失败');
  }
};

// 获取当前选中国家的代码
const handleCountryChange = () => {
  const selectedCountry = countries.value.find(country => country.id === postalCodeForm.country_id);
  currentCountryCode.value = selectedCountry?.iso_code || '';
  // 重新验证邮政编码格式
  validatePostalCodeFormat();
};

// 验证邮政编码格式
const validatePostalCodeFormat = () => {
  if (!postalCodeForm.code || !currentCountryCode.value) {
    isPostalCodeValid.value = true;
    postalCodeValidationMessage.value = '';
    return;
  }
  
  const isValid = validatePostalCode(postalCodeForm.code, currentCountryCode.value);
  const example = getPostalCodeExample(currentCountryCode.value);
  isPostalCodeValid.value = isValid;
  
  if (isValid) {
    postalCodeValidationMessage.value = '';
  } else {
    postalCodeValidationMessage.value = `邮政编码格式不正确，示例：${example}`;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getPostalCodes();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getPostalCodes();
};

// 当前页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getPostalCodes();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedPostalCodes.value = selection;
};

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增邮政编码';
  resetForm();
  dialogVisible.value = true;
};

// 显示编辑弹窗
const showEditDialog = (row: any) => {
  dialogTitle.value = '编辑邮政编码';
  Object.assign(postalCodeForm, row);
  
  // 设置当前国家代码
  const selectedCountry = countries.value.find(country => country.id === row.country_id);
  currentCountryCode.value = selectedCountry?.iso_code || '';
  
  // 验证初始邮政编码格式
  validatePostalCodeFormat();
  
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (postalCodeFormRef.value) {
    postalCodeFormRef.value.resetFields();
  }
  Object.assign(postalCodeForm, {
    id: '',
    code: '',
    country_id: '',
    status: 1,
  });
  currentCountryCode.value = '';
  isPostalCodeValid.value = true;
  postalCodeValidationMessage.value = '';
};

// 提交表单
const handleSubmit = async () => {
  if (!postalCodeFormRef.value) return;
  
  try {
    await postalCodeFormRef.value.validate();
    submitting.value = true;
    
    if (postalCodeForm.id) {
      // 编辑
      await api.put(`/postalCode/${postalCodeForm.id}`, postalCodeForm);
      ElMessage.success('邮政编码编辑成功');
    } else {
      // 新增
      await api.post('/postalCode', postalCodeForm);
      ElMessage.success('邮政编码新增成功');
    }
    
    dialogVisible.value = false;
    getPostalCodes();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await api.patch(`/postalCode/${row.id}/status`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除邮政编码
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/postalCode/${id}`);
    ElMessage.success('邮政编码删除成功');
    getPostalCodes();
  } catch (error) {
    ElMessage.error('邮政编码删除失败');
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 初始化
onMounted(() => {
  getPostalCodes();
  getAllCountries();
});
</script>

<style scoped>
.postal-code-container {
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

.postal-code-list-card {
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

.postal-code-example {
  font-size: 12px;
  color: #909399;
  margin-right: 10px;
}

.validation-message {
  margin-top: 8px;
  font-size: 12px;
}

.validation-message.error {
  color: #f56c6c;
}

.validation-message.success {
  color: #67c23a;
}
</style>