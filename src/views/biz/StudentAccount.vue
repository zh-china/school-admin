<template>
  <div class="page">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="用户名" clearable @keyup.enter="handleQuery" style="width:200px" />
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
          <span>学生账号列表</span>
          <el-button type="primary" @click="openDialog(null)">新增账号</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column show-overflow-tooltip prop="id" label="ID" width="60" />
        <el-table-column show-overflow-tooltip prop="studentId" label="学生ID" min-width="90" />
        <el-table-column show-overflow-tooltip prop="username" label="用户名" min-width="140" />
        <el-table-column show-overflow-tooltip prop="status" label="状态" width="80">
          <template #default="{row}">
            <el-tag :type="row.status===1?'success':'danger'">{{ row.status===1?'启用':'禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="createTime" label="创建时间" min-width="160" />
        <el-table-column show-overflow-tooltip label="操作" width="280" fixed="right">
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

    <el-dialog :title="dialogMode==='add'?'新增学生账号':'编辑学生账号'" v-model="dialogVisible" width="500px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="dialogForm.studentId" placeholder="请选择学生" style="width:100%" filterable :disabled="dialogMode==='edit'">
            <el-option v-for="s in studentList" :key="s.id" :label="s.studentName + ' (' + s.studentNo + ')'" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" :disabled="dialogMode==='edit'" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogMode==='add'">
          <el-input v-model="dialogForm.password" type="password" show-password />
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
import * as accountApi from '../../api/student-account'
import * as studentApi from '../../api/student'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const studentList = ref([])

const queryForm = reactive({ current: 1, size: 10, keyword: '' })

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)
const dialogForm = reactive({ id: null, studentId: null, username: '', password: '', status: 1 })

const dialogRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

onMounted(() => { fetchData(); loadStudents() })

async function loadStudents() {
  try {
    const res = await studentApi.getStudentPage({ current: 1, size: 200 })
    studentList.value = res.data.records
  } catch (e) {}
}

async function fetchData() {
  loading.value = true
  try { const res = await accountApi.getStudentAccountPage(queryForm); tableData.value = res.data.records; total.value = res.data.total }
  finally { loading.value = false }
}

function handleQuery() { queryForm.current = 1; fetchData() }

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  Object.assign(dialogForm, { id: null, studentId: null, username: '', password: '', status: 1 })
  if (row) Object.keys(dialogForm).forEach(k => { if (row[k] !== undefined) dialogForm[k] = row[k] })
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (dialogMode.value === 'add') await accountApi.addStudentAccount(dialogForm)
    else await accountApi.updateStudentAccount(dialogForm)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally { saving.value = false }
}

function handleResetPwd(row) {
  ElMessageBox.prompt('请输入新密码', '重置密码', { type: 'warning' }).then(async ({ value }) => {
    await accountApi.resetStudentPwd(row.id, value)
    ElMessage.success('密码重置成功')
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除账号「${row.username}」？`, '提示', { type: 'warning' })
    .then(async () => { await accountApi.deleteStudentAccount(row.id); ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}
</script>
