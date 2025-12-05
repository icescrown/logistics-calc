<template>
  <div class="quotation-import-container">
    <h2 class="page-title">报价导入导出</h2>
    
    <el-row :gutter="20">
      <!-- 导入区域 -->
      <el-col :span="12">
        <el-card class="import-card">
          <template #header>
            <div class="card-header">
              <span>导入报价</span>
            </div>
          </template>
          
          <div class="import-content">
            <el-alert
              title="导入说明"
              type="info"
              :closable="false"
              style="margin-bottom: 20px;"
            >
              <ul>
                <li>请使用系统提供的模板文件进行导入</li>
                <li>确保导入数据格式正确，避免导入失败</li>
                <li>导入过程中请勿关闭页面</li>
              </ul>
            </el-alert>
            
            <div class="import-actions">
              <el-button
                type="primary"
                @click="downloadTemplate"
                style="margin-right: 10px;"
              >
                <el-icon><Download /></el-icon>
                下载模板
              </el-button>
              
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="true"
                accept=".xlsx,.xls"
                style="display: inline-block;"
              >
                <el-button type="success">
                  <el-icon><Upload /></el-icon>
                  选择文件
                </el-button>
              </el-upload>
              
              <el-button
                type="warning"
                @click="handleImport"
                :disabled="!selectedFile"
                :loading="importing"
                style="margin-left: 10px;"
              >
                <el-icon><CircleCheck /></el-icon>
                开始导入
              </el-button>
            </div>
            
            <div class="file-info" v-if="selectedFile">
              <el-tag type="info">{{ selectedFile.name }}</el-tag>
              <el-button
                type="text"
                size="small"
                @click="clearFile"
                style="margin-left: 10px;"
              >
                清除
              </el-button>
            </div>
            
            <!-- 导入结果 -->
            <div class="import-result" v-if="importResult">
              <el-divider>导入结果</el-divider>
              <el-alert
                :title="importResult.success ? '导入成功' : '导入失败'"
                :type="importResult.success ? 'success' : 'error'"
                :closable="false"
              >
                <template v-if="importResult.success">
                  <p>成功导入 {{ importResult.successCount }} 条数据</p>
                  <p v-if="importResult.failedCount > 0">失败 {{ importResult.failedCount }} 条数据</p>
                  <el-button
                    type="text"
                    size="small"
                    @click="downloadFailedData"
                    v-if="importResult.failedData && importResult.failedData.length > 0"
                  >
                    下载失败数据
                  </el-button>
                </template>
                <template v-else>
                  <p>{{ importResult.message }}</p>
                </template>
              </el-alert>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 导出区域 -->
      <el-col :span="12">
        <el-card class="export-card">
          <template #header>
            <div class="card-header">
              <span>导出报价</span>
            </div>
          </template>
          
          <div class="export-content">
            <el-alert
              title="导出说明"
              type="info"
              :closable="false"
              style="margin-bottom: 20px;"
            >
              <ul>
                <li>可以选择导出全部报价或当前筛选结果</li>
                <li>导出文件格式为Excel</li>
                <li>导出过程中请勿关闭页面</li>
              </ul>
            </el-alert>
            
            <div class="export-actions">
              <el-button
                type="primary"
                @click="handleExportAll"
                :loading="exporting"
                style="margin-right: 10px;"
              >
                <el-icon><Download /></el-icon>
                导出全部
              </el-button>
              
              <el-button
                type="success"
                @click="handleExportSelected"
                :loading="exporting"
              >
                <el-icon><Download /></el-icon>
                导出筛选结果
              </el-button>
            </div>
            
            <!-- 筛选条件 -->
            <el-divider>筛选条件</el-divider>
            
            <el-form :model="filterForm" label-width="100px" size="small">
              <el-row :gutter="20">
                <el-col :span="11">
                  <el-form-item label="承运商">
                    <el-select
                      v-model="filterForm.carrier_id"
                      placeholder="请选择承运商"
                      clearable
                      style="width: 100%;"
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
                <el-col :span="11">
                  <el-form-item label="物流方式">
                    <el-select
                      v-model="filterForm.logistics_method_id"
                      placeholder="请选择物流方式"
                      clearable
                      style="width: 100%;"
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
                <el-col :span="11">
                  <el-form-item label="区域">
                    <el-select
                      v-model="filterForm.region_id"
                      placeholder="请选择区域"
                      clearable
                      style="width: 100%;"
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
                <el-col :span="11">
                  <el-form-item label="状态">
                    <el-select
                      v-model="filterForm.status"
                      placeholder="请选择状态"
                      clearable
                      style="width: 100%;"
                    >
                      <el-option label="启用" value="1"></el-option>
                      <el-option label="禁用" value="0"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row>
                <el-col :span="22">
                  <el-form-item>
                    <el-button
                      type="primary"
                      @click="handleFilter"
                      size="small"
                      style="margin-right: 10px;"
                    >
                      <el-icon><Search /></el-icon>
                      筛选
                    </el-button>
                    <el-button
                      type="default"
                      @click="resetFilter"
                      size="small"
                    >
                      <el-icon><RefreshRight /></el-icon>
                      重置
                    </el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import api from '../../api';
import { ElMessage } from 'element-plus';
import {
  Download,
  Upload,
  CircleCheck,
  Search,
  RefreshRight,
} from '@element-plus/icons-vue';

// 文件上传相关
const uploadRef = ref();
const selectedFile = ref<any>(null);
const importing = ref(false);
const exporting = ref(false);
const importResult = ref<any>(null);

// 基础数据列表
const carriers = ref<any[]>([]);
const logisticsMethods = ref<any[]>([]);
const regions = ref<any[]>([]);

// 筛选条件
const filterForm = reactive({
  carrier_id: '',
  logistics_method_id: '',
  region_id: '',
  status: '',
});

// 获取基础数据列表
const getBaseData = async () => {
  try {
    // 获取承运商列表
    const carriersResult = await api.get('/carrier');
    carriers.value = Array.isArray(carriersResult) ? carriersResult : [];
    
    // 获取物流方式列表
    const methodsResult = await api.get('/logistics-method');
    logisticsMethods.value = Array.isArray(methodsResult) ? methodsResult : [];
    
    // 获取区域列表
    const regionsResult = await api.get('/region');
    regions.value = Array.isArray(regionsResult) ? regionsResult : [];
  } catch (error) {
    ElMessage.error('获取基础数据失败');
  }
};

// 下载模板
const downloadTemplate = async () => {
  try {
    const response = await api.get('/quotation/export-template', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotation-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success('模板下载成功');
  } catch (error) {
    ElMessage.error('模板下载失败');
  }
};

// 文件选择变化
const handleFileChange = (file: any) => {
  selectedFile.value = file;
};

// 清除选中文件
const clearFile = () => {
  selectedFile.value = null;
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 开始导入
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件');
    return;
  }
  
  try {
    importing.value = true;
    importResult.value = null;
    
    const formData = new FormData();
    formData.append('file', selectedFile.value.raw);
    
    const result = await api.post('/quotation/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    importResult.value = result;
    ElMessage.success('导入完成');
  } catch (error) {
    ElMessage.error('导入失败');
  } finally {
    importing.value = false;
  }
};

// 下载失败数据
const downloadFailedData = () => {
  if (!importResult.value?.failedData) {
    return;
  }
  
  try {
    // 这里需要实现失败数据的下载逻辑
    ElMessage.info('下载功能开发中');
  } catch (error) {
    ElMessage.error('下载失败');
  }
};

// 导出全部
const handleExportAll = async () => {
  try {
    exporting.value = true;
    await exportQuotations({ all: true });
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 导出筛选结果
const handleExportSelected = async () => {
  try {
    exporting.value = true;
    await exportQuotations({ all: false, filter: filterForm });
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 执行导出
const exportQuotations = async (params: any) => {
  try {
    const response = await api.post('/quotation/export', params, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotations-${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    throw error;
  }
};

// 筛选
const handleFilter = () => {
  ElMessage.info('筛选功能开发中');
};

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    carrier_id: '',
    logistics_method_id: '',
    region_id: '',
    status: '',
  });
};

// 初始化
onMounted(() => {
  getBaseData();
});
</script>

<style scoped>
.quotation-import-container {
  width: 100%;
  height: 100%;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.import-card,
.export-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-content,
.export-content {
  padding: 20px 0;
}

.import-actions,
.export-actions {
  margin-bottom: 20px;
}

.file-info {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.import-result {
  margin-top: 20px;
}
</style>