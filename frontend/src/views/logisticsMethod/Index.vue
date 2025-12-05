<template>
  <div class="logistics-method-container">
    <h2 class="page-title">物流方式管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        @click="showAddDialog"
      >
        <el-icon><Plus /></el-icon>
        新增物流方式
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="请输入物流方式名称或编码"
        clearable
        style="width: 300px; margin-left: 20px;"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 物流方式列表 -->
    <el-card class="logistics-method-list-card">
      <el-table
        :data="logisticsMethods"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="name" label="物流方式名称" width="180"></el-table-column>
        <el-table-column prop="code" label="物流方式编码" width="150"></el-table-column>
        <el-table-column prop="carrier.name" label="所属承运商" width="150"></el-table-column>
        <el-table-column prop="type" label="物流类型" width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
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
        ref="logisticsMethodFormRef"
        :model="logisticsMethodForm"
        :rules="logisticsMethodRules"
        label-width="120px"
      >
        <el-form-item label="物流方式名称" prop="name">
          <el-input
            v-model="logisticsMethodForm.name"
            placeholder="请输入物流方式名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="物流方式编码" prop="code">
          <el-input
            v-model="logisticsMethodForm.code"
            placeholder="请输入物流方式编码"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="所属承运商" prop="carrier_id">
          <el-select
            v-model="logisticsMethodForm.carrier_id"
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
        <el-form-item label="物流类型" prop="type">
          <el-select
            v-model="logisticsMethodForm.type"
            placeholder="请选择物流类型"
            clearable
          >
            <el-option label="空运" value="空运"></el-option>
            <el-option label="海运" value="海运"></el-option>
            <el-option label="陆运" value="陆运"></el-option>
            <el-option label="快递" value="快递"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="logisticsMethodForm.description"
            placeholder="请输入物流方式描述"
            type="textarea"
            :rows="3"
            clearable
          ></el-input>
        </el-form-item>
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

// 物流方式列表数据
const logisticsMethods = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedLogisticsMethods = ref<any[]>([]);

// 承运商列表
const carriers = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('新增物流方式');
const submitting = ref(false);

// 表单引用
const logisticsMethodFormRef = ref();

// 表单数据
const logisticsMethodForm = reactive({
  id: '',
  name: '',
  code: '',
  carrier_id: '',
  type: '',
  description: '',
  status: 1,
});

// 表单验证规则
const logisticsMethodRules = {
  name: [
    { required: true, message: '请输入物流方式名称', trigger: 'blur' },
    { min: 2, max: 50, message: '物流方式名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入物流方式编码', trigger: 'blur' },
    { min: 2, max: 20, message: '物流方式编码长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  carrier_id: [
    { required: true, message: '请选择所属承运商', trigger: 'blur' },
  ],
};

// 获取物流方式列表
const getLogisticsMethods = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value,
    };
    const result = await api.get('/logistics-method', { params });
    logisticsMethods.value = Array.isArray(result.list) ? result.list : [];
    total.value = result.total || 0;
  } catch (error) {
    ElMessage.error('获取物流方式列表失败');
  }
};

// 获取承运商列表
const getCarriers = async () => {
  try {
    const result = await api.get('/carrier', { params: { page: 1, page_size: 100 } });
    carriers.value = Array.isArray(result.list) ? result.list : [];
  } catch (error) {
    ElMessage.error('获取承运商列表失败');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getLogisticsMethods();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getLogisticsMethods();
};

// 当前页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getLogisticsMethods();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedLogisticsMethods.value = selection;
};

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增物流方式';
  resetForm();
  dialogVisible.value = true;
};

// 显示编辑弹窗
const showEditDialog = (row: any) => {
  dialogTitle.value = '编辑物流方式';
  Object.assign(logisticsMethodForm, row);
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (logisticsMethodFormRef.value) {
    logisticsMethodFormRef.value.resetFields();
  }
  Object.assign(logisticsMethodForm, {
    id: '',
    name: '',
    code: '',
    carrier_id: '',
    type: '',
    description: '',
    status: 1,
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!logisticsMethodFormRef.value) return;
  
  try {
    await logisticsMethodFormRef.value.validate();
    submitting.value = true;
    
    if (logisticsMethodForm.id) {
      // 编辑
      await api.put(`/logistics-method/${logisticsMethodForm.id}`, logisticsMethodForm);
      ElMessage.success('物流方式编辑成功');
    } else {
      // 新增
      await api.post('/logistics-method', logisticsMethodForm);
      ElMessage.success('物流方式新增成功');
    }
    
    dialogVisible.value = false;
    getLogisticsMethods();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await api.patch(`/logistics-method/${row.id}/status`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除物流方式
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/logistics-method/${id}`);
    ElMessage.success('物流方式删除成功');
    getLogisticsMethods();
  } catch (error) {
    ElMessage.error('物流方式删除失败');
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 初始化
onMounted(() => {
  getLogisticsMethods();
  getCarriers();
});
</script>

<style scoped>
.logistics-method-container {
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

.logistics-method-list-card {
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
</style>