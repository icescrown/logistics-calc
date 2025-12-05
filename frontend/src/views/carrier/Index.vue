<template>
  <div class="carrier-container">
    <h2 class="page-title">承运商管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        @click="showAddDialog"
      >
        <el-icon><Plus /></el-icon>
        新增承运商
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="请输入承运商名称或编码"
        clearable
        style="width: 300px; margin-left: 20px;"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 承运商列表 -->
    <el-card class="carrier-list-card">
      <el-table
        :data="carriers"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="name" label="承运商名称" width="180"></el-table-column>
        <el-table-column prop="code" label="承运商编码" width="150"></el-table-column>
        <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
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
        ref="carrierFormRef"
        :model="carrierForm"
        :rules="carrierRules"
        label-width="120px"
      >
        <el-form-item label="承运商名称" prop="name">
          <el-input
            v-model="carrierForm.name"
            placeholder="请输入承运商名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="承运商编码" prop="code">
          <el-input
            v-model="carrierForm.code"
            placeholder="请输入承运商编码"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input
            v-model="carrierForm.contact"
            placeholder="请输入联系人"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="carrierForm.phone"
            placeholder="请输入联系电话"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="carrierForm.email"
            placeholder="请输入邮箱"
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

// 承运商列表数据
const carriers = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedCarriers = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('新增承运商');
const submitting = ref(false);

// 表单引用
const carrierFormRef = ref();

// 表单数据
const carrierForm = reactive({
  id: '',
  name: '',
  code: '',
  contact: '',
  phone: '',
  email: '',
  status: 1,
});

// 表单验证规则
const carrierRules = {
  name: [
    { required: true, message: '请输入承运商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '承运商名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入承运商编码', trigger: 'blur' },
    { min: 2, max: 20, message: '承运商编码长度在 2 到 20 个字符', trigger: 'blur' },
  ],
};

// 获取承运商列表
const getCarriers = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value,
    };
    const result = await api.get('/carrier', { params });
    carriers.value = Array.isArray(result.list) ? result.list : [];
    total.value = result.total || 0;
  } catch (error) {
    ElMessage.error('获取承运商列表失败');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getCarriers();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getCarriers();
};

// 当前页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getCarriers();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedCarriers.value = selection;
};

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增承运商';
  resetForm();
  dialogVisible.value = true;
};

// 显示编辑弹窗
const showEditDialog = (row: any) => {
  dialogTitle.value = '编辑承运商';
  Object.assign(carrierForm, row);
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (carrierFormRef.value) {
    carrierFormRef.value.resetFields();
  }
  Object.assign(carrierForm, {
    id: '',
    name: '',
    code: '',
    contact: '',
    phone: '',
    email: '',
    status: 1,
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!carrierFormRef.value) return;
  
  try {
    await carrierFormRef.value.validate();
    submitting.value = true;
    
    if (carrierForm.id) {
      // 编辑
      await api.put(`/carrier/${carrierForm.id}`, carrierForm);
      ElMessage.success('承运商编辑成功');
    } else {
      // 新增
      await api.post('/carrier', carrierForm);
      ElMessage.success('承运商新增成功');
    }
    
    dialogVisible.value = false;
    getCarriers();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await api.patch(`/carrier/${row.id}/status`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除承运商
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/carrier/${id}`);
    ElMessage.success('承运商删除成功');
    getCarriers();
  } catch (error) {
    ElMessage.error('承运商删除失败');
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 初始化
onMounted(() => {
  getCarriers();
});
</script>

<style scoped>
.carrier-container {
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

.carrier-list-card {
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