<template>
  <div class="warehouse-container">
    <h2 class="page-title">发出仓库管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        @click="showAddDialog"
      >
        <el-icon><Plus /></el-icon>
        新增仓库
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="请输入仓库名称或编码"
        clearable
        style="width: 300px; margin-left: 20px;"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 仓库列表 -->
    <el-card class="warehouse-list-card">
      <el-table
        :data="warehouses"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="name" label="仓库名称" width="180"></el-table-column>
        <el-table-column prop="code" label="仓库编码" width="150"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
        <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
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
        ref="warehouseFormRef"
        :model="warehouseForm"
        :rules="warehouseRules"
        label-width="120px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input
            v-model="warehouseForm.name"
            placeholder="请输入仓库名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="仓库编码" prop="code">
          <el-input
            v-model="warehouseForm.code"
            placeholder="请输入仓库编码"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="warehouseForm.address"
            placeholder="请输入仓库地址"
            type="textarea"
            :rows="3"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input
            v-model="warehouseForm.contact"
            placeholder="请输入联系人"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="warehouseForm.phone"
            placeholder="请输入联系电话"
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

// 仓库列表数据
const warehouses = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedWarehouses = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('新增仓库');
const submitting = ref(false);

// 表单引用
const warehouseFormRef = ref();

// 表单数据
const warehouseForm = reactive({
  id: '',
  name: '',
  code: '',
  address: '',
  contact: '',
  phone: '',
  status: 1,
});

// 表单验证规则
const warehouseRules = {
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { min: 2, max: 50, message: '仓库名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入仓库编码', trigger: 'blur' },
    { min: 2, max: 20, message: '仓库编码长度在 2 到 20 个字符', trigger: 'blur' },
  ],
};

// 获取仓库列表
const getWarehouses = async () => {
  try {
    console.log('开始获取仓库列表');
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value,
    };
    console.log('请求参数:', params);
    const result = await api.get('/warehouse', { params });
    console.log('响应结果:', result);
    warehouses.value = Array.isArray(result.list) ? result.list : [];
    total.value = result.total || 0;
    console.log('处理后的数据:', warehouses.value, total.value);
  } catch (error) {
    console.error('获取仓库列表失败:', error);
    ElMessage.error('获取仓库列表失败');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getWarehouses();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getWarehouses();
};

// 当前页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getWarehouses();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedWarehouses.value = selection;
};

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增仓库';
  resetForm();
  dialogVisible.value = true;
};

// 显示编辑弹窗
const showEditDialog = (row: any) => {
  dialogTitle.value = '编辑仓库';
  Object.assign(warehouseForm, row);
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (warehouseFormRef.value) {
    warehouseFormRef.value.resetFields();
  }
  Object.assign(warehouseForm, {
    id: '',
    name: '',
    code: '',
    address: '',
    contact: '',
    phone: '',
    status: 1,
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!warehouseFormRef.value) return;
  
  try {
    await warehouseFormRef.value.validate();
    submitting.value = true;
    
    if (warehouseForm.id) {
      // 编辑
      await api.put(`/warehouse/${warehouseForm.id}`, warehouseForm);
      ElMessage.success('仓库编辑成功');
    } else {
      // 新增
      await api.post('/warehouse', warehouseForm);
      ElMessage.success('仓库新增成功');
    }
    
    dialogVisible.value = false;
    getWarehouses();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await api.patch(`/warehouse/${row.id}/status`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除仓库
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/warehouse/${id}`);
    ElMessage.success('仓库删除成功');
    getWarehouses();
  } catch (error) {
    ElMessage.error('仓库删除失败');
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 初始化
onMounted(() => {
  getWarehouses();
});
</script>

<style scoped>
.warehouse-container {
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

.warehouse-list-card {
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