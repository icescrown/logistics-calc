<template>
  <div class="region-container">
    <h2 class="page-title">区域管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        @click="showAddDialog"
      >
        <el-icon><Plus /></el-icon>
        新增区域
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="请输入区域名称或编码"
        clearable
        style="width: 300px; margin-left: 20px;"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 区域列表 -->
    <el-card class="region-list-card">
      <el-table
        :data="regions"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="name" label="区域名称" width="180"></el-table-column>
        <el-table-column prop="code" label="区域编码" width="150"></el-table-column>
        <el-table-column label="关联国家" width="200">
          <template #default="scope">
            <el-tag v-for="country in scope.row.countries" :key="country.id" size="small" style="margin-right: 5px;">
              {{ country.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联邮政编码" width="200">
          <template #default="scope">
            <el-tag v-for="postalCode in scope.row.postalCodes" :key="postalCode.id" size="small" style="margin-right: 5px;" type="info">
              {{ postalCode.code }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="区域类型" width="120">
          <template #default="scope">
            {{ scope.row.type === 'country' ? '国家' : '邮编' }}
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
      width="800px"
    >
      <el-form
        ref="regionFormRef"
        :model="regionForm"
        :rules="regionRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="区域名称" prop="name">
              <el-input
                v-model="regionForm.name"
                placeholder="请输入区域名称"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="区域编码" prop="code">
              <el-input
                v-model="regionForm.code"
                placeholder="请输入区域编码"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="区域类型" prop="type">
              <el-select
                v-model="regionForm.type"
                placeholder="请选择区域类型"
                clearable
              >
                <el-option label="国家" value="country"></el-option>
                <el-option label="邮编" value="postal_code"></el-option>
              </el-select>
              <div class="selection-hint">
                提示：请选择区域类型，只能选择国家或邮编中的一种
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 国家选择 -->
        <el-row v-if="regionForm.type === 'country'" :gutter="20">
          <el-col :span="24">
            <el-form-item label="关联国家" prop="country_ids">
              <div class="selection-type-label">国家选择</div>
              <el-select
                v-model="regionForm.country_ids"
                placeholder="请选择关联国家"
                multiple
                collapse-tags
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="country in countries"
                  :key="country.id"
                  :label="`${country.iso_code} ${country.name}`"
                  :value="country.id"
                ></el-option>
              </el-select>
              <div class="selection-hint">
                提示：可选择多个国家，支持搜索过滤
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 邮政编码选择 -->
        <el-row v-if="regionForm.type === 'postal_code'" :gutter="20">
          <el-col :span="24">
            <el-form-item label="关联国家" prop="country_ids">
              <div class="selection-type-label">国家选择</div>
              <el-select
                v-model="regionForm.country_ids"
                placeholder="请选择关联国家"
                multiple
                collapse-tags
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="country in countries"
                  :key="country.id"
                  :label="`${country.iso_code} ${country.name}`"
                  :value="country.id"
                ></el-option>
              </el-select>
              <div class="selection-hint">
                提示：可选择多个国家，支持搜索过滤
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row v-if="regionForm.type === 'postal_code'" :gutter="20">
          <el-col :span="24">
            <el-form-item label="邮政编码" prop="postal_code_text">
              <div class="selection-type-label">邮政编码选择</div>
              <el-input
                v-model="regionForm.postal_code_text"
                placeholder="请输入邮政编码，支持多种格式"
                clearable
                type="textarea"
                :rows="4"
              ></el-input>
              <div class="selection-hint">
                <strong>支持格式：</strong>
                <ul class="postal-code-formats">
                  <li>单个邮编：12345</li>
                  <li>多个邮编：12345,67890</li>
                  <li>范围：12300-12400</li>
                  <li>通配符：123*</li>
                  <li>组合：12345,67890,90000-91000,100*</li>
                </ul>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="regionForm.status"
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

// 区域列表数据
const regions = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedRegions = ref<any[]>([]);

// 国家和邮政编码数据
const countries = ref<any[]>([]);
const availablePostalCodes = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('新增区域');
const submitting = ref(false);

// 表单引用
const regionFormRef = ref();

// 表单数据
const regionForm = reactive({
  id: '',
  name: '',
  code: '',
  type: '',
  status: 1,
  country_ids: [] as number[],
  postal_code_ids: [] as number[],
  postal_code_text: '', // 邮政编码文本输入
});

// 当前选中国家的ISO代码
const selectedCountryCodes = ref<string[]>([]);

// 表单验证规则
const regionRules = {
  name: [
    { required: true, message: '请输入区域名称', trigger: 'blur' },
    { min: 2, max: 50, message: '区域名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入区域编码', trigger: 'blur' },
    { min: 2, max: 20, message: '区域编码长度在 2 到 20 个字符', trigger: 'blur' },
  ],
};

// 获取区域列表
const getRegions = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value,
    };
    const result = await api.get('/region', { params });
    regions.value = Array.isArray(result.list) ? result.list : [];
    total.value = result.total || 0;
  } catch (error) {
    ElMessage.error('获取区域列表失败');
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

// 根据国家ID获取邮政编码
const getPostalCodesByCountryId = async (countryId: number) => {
  try {
    const result = await api.get(`/region/postal-codes/${countryId}`);
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    ElMessage.error('获取邮政编码失败');
    return [];
  }
};

// 处理国家选择变化
const handleCountryChange = async () => {
  // 清空当前邮政编码选择
  regionForm.postal_code_ids = [];
  regionForm.postal_code_text = '';
  
  // 获取所有选中国家的ISO代码
  selectedCountryCodes.value = [];
  for (const countryId of regionForm.country_ids) {
    const country = countries.value.find(c => c.id === countryId);
    if (country) {
      selectedCountryCodes.value.push(country.iso_code);
    }
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getRegions();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getRegions();
};

// 当前页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getRegions();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRegions.value = selection;
};

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增区域';
  resetForm();
  dialogVisible.value = true;
};

// 显示编辑弹窗
const showEditDialog = async (row: any) => {
  dialogTitle.value = '编辑区域';
  
  // 复制基本信息
  // 将现有的邮政编码转换为文本格式
  const existingPostalCodes = row.postalCodes.map((postalCode: any) => postalCode.code).join(', ');
  
  Object.assign(regionForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    status: row.status,
    country_ids: row.countries.map((country: any) => country.id),
    postal_code_ids: row.postalCodes.map((postalCode: any) => postalCode.id),
    postal_code_text: existingPostalCodes, // 填充现有的邮政编码文本
  });
  
  // 获取所有选中国家的ISO代码
  selectedCountryCodes.value = [];
  for (const countryId of regionForm.country_ids) {
    const country = countries.value.find(c => c.id === countryId);
    if (country) {
      selectedCountryCodes.value.push(country.iso_code);
    }
  }
  
  // 获取所有选中国家的邮政编码
  const allPostalCodes: any[] = [];
  for (const countryId of regionForm.country_ids) {
    const countryPostalCodes = await getPostalCodesByCountryId(countryId);
    allPostalCodes.push(...countryPostalCodes);
  }
  
  // 更新可用邮政编码列表
  availablePostalCodes.value = allPostalCodes;
  
  // 重置邮政编码相关状态
  // 注意：isPostalCodeValid和postalCodeError变量未定义，已移除引用
  
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (regionFormRef.value) {
    regionFormRef.value.resetFields();
  }
  Object.assign(regionForm, {
    id: '',
    name: '',
    code: '',
    type: '',
    status: 1,
    country_ids: [],
    postal_code_ids: [],
  });
  availablePostalCodes.value = [];
};

// 提交表单
const handleSubmit = async () => {
  if (!regionFormRef.value) return;
  
  // 验证区域类型是否选择
  if (!regionForm.type) {
    ElMessage.error('请选择区域类型');
    return;
  }
  
  // 验证对应类型的必填字段
  if (regionForm.type === 'country' && regionForm.country_ids.length === 0) {
    ElMessage.error('请选择至少一个关联国家');
    return;
  }
  
  if (regionForm.type === 'postal_code') {
    if (regionForm.country_ids.length === 0) {
      ElMessage.error('请选择至少一个关联国家');
      return;
    }
    
    if (!regionForm.postal_code_text.trim()) {
      ElMessage.error('请输入邮政编码');
      return;
    }
  }
  
  try {
    await regionFormRef.value.validate();
    submitting.value = true;
    
    // 准备提交数据
    const submitData = { ...regionForm };
    
    // 移除不需要的字段
    delete submitData.postal_code_ids;
    
    if (submitData.id) {
      // 编辑
      await api.put(`/region/${submitData.id}`, submitData);
      ElMessage.success('区域编辑成功');
    } else {
      // 新增
      await api.post('/region', submitData);
      ElMessage.success('区域新增成功');
    }
    
    dialogVisible.value = false;
    getRegions();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await api.patch(`/region/${row.id}/status`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除区域
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/region/${id}`);
    ElMessage.success('区域删除成功');
    getRegions();
  } catch (error) {
    ElMessage.error('区域删除失败');
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 初始化
onMounted(() => {
  getRegions();
  getAllCountries();
});
</script>

<style scoped>
.region-container {
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

.region-list-card {
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

.selection-type-label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.selection-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.postal-code-formats {
  margin: 8px 0 0 16px;
  padding: 0;
  list-style-type: disc;
}

.postal-code-formats li {
  margin-bottom: 4px;
  font-size: 12px;
  color: #606266;
}

.postal-code-example {
  color: #409eff;
  font-size: 12px;
  font-weight: normal;
}

.postal-code-error {
  margin-top: 8px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.5;
}

.postal-code-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>