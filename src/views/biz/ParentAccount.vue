<template>
  <div class="page">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="用户名/姓名/手机号" clearable @keyup.enter="handleQuery" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="queryForm.keyword='';handleQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:16px">
      <template #header>
        <div class="card-header">
          <span>家长账号列表</span>
          <el-button type="primary" @click="openDialog(null)">新增账号</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{row}">
            <el-tag :type="row.status===1?'success':'danger'">{{ row.status===1?'启用':'禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{row}">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="queryForm.current"
        v-model:page-size="queryForm.size"
        :total="total"
        layout="total, prev, pager, next"
        @change="fetchData"
        style="margin-top:16px;justify-content:flex-end"
      />
    </el-card>

    <el-dialog :title="dialogMode==='add'?'新增家长账号':'编辑家长账号'" v-model="dialogVisible" width="500px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" :disabled="dialogMode==='edit'" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogMode==='add'">
          <el-input v-model="dialogForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="dialogForm.realName" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="dialogForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="dialogForm.email" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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
import * as accountApi from '../../api/parent-account'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryForm = reactive({ current: 1, size: 10, keyword: '' })

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)
const dialogForm = reactive({
  id: null, username: '', password: '', realName: '', phone: '', email: '', status: 1
})

const dialogRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try { const res = await accountApi.getParentAccountPage(queryForm); tableData.value = res.data.records; total.value = res.data.total }
  finally { loading.value = false }
}

function handleQuery() { queryForm.current = 1; fetchData() }

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  Object.assign(dialogForm, { id: null, username: '', password: '', realName: '', phone: '', email: '', status: 1 })
  if (row) Object.keys(dialogForm).forEach(k => { if (row[k] !== undefined) dialogForm[k] = row[k] })
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (dialogMode.value === 'add') await accountApi.addParentAccount(dialogForm)
    else await accountApi.updateParentAccount(dialogForm)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally { saving.value = false }
}

function handleResetPwd(row) {
  ElMessageBox.prompt('请输入新密码', '重置密码', { type: 'warning' }).then(async ({ value }) => {
    await accountApi.resetParentPwd(row.id, value)
    ElMessage.success('密码重置成功')
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除账号「${row.username}」？`, '提示', { type: 'warning' })
    .then(async () => { await accountApi.deleteParentAccount(row.id); ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}
</script>
