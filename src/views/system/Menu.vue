<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="openDialog(null, 0)">新增菜单</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe row-key="id" v-loading="loading"
        :tree-props="{ children: 'children' }" default-expand-all>
        <el-table-column prop="menuName" label="名称" width="200" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{row}">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="menuType" label="类型" width="80">
          <template #default="{row}">
            <el-tag :type="row.menuType===1?'':'success'" size="small">
              {{ row.menuType===1?'目录':row.menuType===2?'菜单':'按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="180" />
        <el-table-column prop="component" label="组件路径" width="220" />
        <el-table-column prop="permissionCode" label="权限标识" min-width="180" />
        <el-table-column prop="sortOrder" label="排序" width="60" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{row}">
            <el-button size="small" @click="openDialog(row, row.parentId)">添加子级</el-button>
            <el-button size="small" @click="openDialog(row, row.parentId, row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="getDialogTitle()" v-model="dialogVisible" width="550px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="90px">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="dialogForm.parentId"
            :data="parentOptions"
            :props="{ children: 'children', label: 'label', value: 'value', disabled: 'disabled' }"
            check-strictly
            clearable
            placeholder="不选则为顶级"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="dialogForm.menuName" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="dialogForm.menuType">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图标" v-if="dialogForm.menuType!==3">
          <el-input v-model="dialogForm.icon" placeholder="Element Plus 图标名, 如 Setting" />
        </el-form-item>
        <el-form-item label="路由路径" v-if="dialogForm.menuType!==3">
          <el-input v-model="dialogForm.path" placeholder="如 /system/account" />
        </el-form-item>
        <el-form-item label="组件路径" v-if="dialogForm.menuType===2">
          <el-input v-model="dialogForm.component" placeholder="如 system/account/index" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permissionCode" v-if="dialogForm.menuType===3">
          <el-input v-model="dialogForm.permissionCode" placeholder="如 sys:account:add" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dialogForm.sortOrder" :min="0" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as menuApi from '../../api/menu'
import { treeToOptions } from '../../utils'

const loading = ref(false)
const tableData = ref([])
const parentOptions = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)
const dialogForm = reactive({
  id: null, parentId: null, menuName: '', menuType: 1,
  path: '', component: '', permissionCode: '', icon: '', sortOrder: 0, status: 1
})

const dialogRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const res = await menuApi.getMenuTree()
    tableData.value = res.data
    // 构建上级菜单选择器（排除按钮）
    const filterOptions = (tree) => tree.filter(m => m.menuType !== 3)
    parentOptions.value = treeToOptions(filterOptions(res.data))
  } finally {
    loading.value = false
  }
}

function getDialogTitle() {
  return dialogMode.value === 'add' ? '新增菜单' : '编辑菜单'
}

function openDialog(parentRow, defaultParentId, editRow) {
  dialogVisible.value = true
  if (editRow) {
    dialogMode.value = 'edit'
    Object.keys(dialogForm).forEach(k => { if (editRow[k] !== undefined) dialogForm[k] = editRow[k] })
    if (!dialogForm.parentId) dialogForm.parentId = 0
  } else {
    dialogMode.value = 'add'
    Object.assign(dialogForm, {
      id: null, parentId: defaultParentId || 0, menuName: '', menuType: 1,
      path: '', component: '', permissionCode: '', icon: '', sortOrder: 0, status: 1
    })
  }
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const data = { ...dialogForm }
    if (data.parentId === 0) data.parentId = 0
    if (dialogMode.value === 'add') {
      await menuApi.addMenu(data)
    } else {
      await menuApi.updateMenu(data)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除「${row.menuName}」及其子菜单？`, '提示', { type: 'warning' })
    .then(async () => {
      await menuApi.deleteMenu(row.id)
      ElMessage.success('删除成功')
      fetchData()
    }).catch(() => {})
}
</script>
