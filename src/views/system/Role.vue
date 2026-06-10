<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="openDialog(null)">新增角色</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column show-overflow-tooltip prop="id" label="ID" width="55" />
        <el-table-column show-overflow-tooltip prop="roleName" label="角色名称" min-width="120" />
        <el-table-column show-overflow-tooltip prop="roleCode" label="角色编码" min-width="120" />
        <el-table-column show-overflow-tooltip prop="description" label="描述" min-width="180" />
        <el-table-column show-overflow-tooltip prop="status" label="状态" width="75">
          <template #default="{row}">
            <el-tag :type="row.status===1?'success':'danger'">{{ row.status===1?'启用':'禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="操作" width="290" fixed="right">
          <template #default="{row}">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openAssignMenu(row)">分配权限</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogMode==='add'?'新增角色':'编辑角色'" v-model="dialogVisible" width="500px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="dialogForm.roleCode" :disabled="dialogMode==='edit'" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dialogForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" :active-value="1" :inactive-value="0" active-text="启用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-dialog title="分配权限" v-model="assignVisible" width="400px">
      <el-tree
        ref="treeRef"
        :data="menuStore.menuTree"
        :props="{ children: 'children', label: 'menuName' }"
        node-key="id"
        show-checkbox
        :default-expand-all="false"
      />
      <template #footer>
        <el-button @click="assignVisible=false">取消</el-button>
        <el-button type="primary" @click="handleAssignSave" :loading="assigning">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as roleApi from '../../api/role'
import * as menuApi from '../../api/menu'
import { useMenuStore } from '../../stores/menu'

const menuStore = useMenuStore()
const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)
const dialogForm = reactive({ id: null, roleName: '', roleCode: '', description: '', status: 1 })
const dialogRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const assignVisible = ref(false)
const assigning = ref(false)
const assignRoleId = ref(null)
const treeRef = ref(null)

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const res = await roleApi.getRoleList()
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  Object.assign(dialogForm, { id: null, roleName: '', roleCode: '', description: '', status: 1 })
  if (row) {
    Object.keys(dialogForm).forEach(k => { if (row[k] !== undefined) dialogForm[k] = row[k] })
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (dialogMode.value === 'add') {
      await roleApi.addRole(dialogForm)
    } else {
      await roleApi.updateRole(dialogForm)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    saving.value = false
  }
}

async function openAssignMenu(row) {
  assignRoleId.value = row.id
  assignVisible.value = true
  await nextTick()
  // 回显已选菜单
  const res = await menuApi.getMenuIdsByRoleId(row.id)
  treeRef.value.setCheckedKeys(res.data)
}

async function handleAssignSave() {
  assigning.value = true
  try {
    const checkedKeys = treeRef.value.getCheckedKeys()
    const halfKeys = treeRef.value.getHalfCheckedKeys()
    await roleApi.assignMenus(assignRoleId.value, [...checkedKeys, ...halfKeys])
    ElMessage.success('权限分配成功')
    assignVisible.value = false
  } finally {
    assigning.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除角色「${row.roleName}」？`, '提示', { type: 'warning' })
    .then(async () => {
      await roleApi.deleteRole(row.id)
      ElMessage.success('删除成功')
      fetchData()
    }).catch(() => {})
}
</script>
