<template>
  <div class="page">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="班级名称/编码/班主任" clearable
            @keyup.enter="handleQuery" style="width:240px" />
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
          <span>班级列表</span>
          <el-button type="primary" @click="openDialog(null)">新增班级</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column show-overflow-tooltip prop="id" label="ID" width="70" />
        <el-table-column show-overflow-tooltip prop="classCode" label="班级编码" width="150" />
        <el-table-column show-overflow-tooltip prop="className" label="班级名称" min-width="180" />
        <el-table-column show-overflow-tooltip prop="grade" label="年级" width="120" />
        <el-table-column show-overflow-tooltip prop="headTeacher" label="班主任" width="120" />
        <el-table-column show-overflow-tooltip prop="status" label="状态" width="80">
          <template #default="{row}">
            <el-tag :type="row.status===1?'success':'danger'">{{ row.status===1?'启用':'停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="description" label="描述" min-width="180" />
        <el-table-column show-overflow-tooltip label="操作" width="160" fixed="right">
          <template #default="{row}">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogMode==='add'?'新增班级':'编辑班级'" v-model="dialogVisible" width="500px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="班级编码" prop="classCode">
          <el-input v-model="dialogForm.classCode" />
        </el-form-item>
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="dialogForm.className" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="dialogForm.grade" />
        </el-form-item>
        <el-form-item label="班主任">
          <el-input v-model="dialogForm.headTeacher" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as classApi from '../../api/class'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryForm = reactive({ current: 1, size: 10, keyword: '' })

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)
const dialogForm = reactive({
  id: null, classCode: '', className: '', grade: '', headTeacher: '', description: '', status: 1
})

const dialogRules = {
  classCode: [{ required: true, message: '请输入班级编码', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }]
}

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const res = await classApi.getClassPage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryForm.current = 1
  fetchData()
}

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  Object.assign(dialogForm, { id: null, classCode: '', className: '', grade: '', headTeacher: '', description: '', status: 1 })
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
      await classApi.addClass(dialogForm)
    } else {
      await classApi.updateClass(dialogForm)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除班级「${row.className}」？`, '提示', { type: 'warning' })
    .then(async () => {
      await classApi.deleteClass(row.id)
      ElMessage.success('删除成功')
      fetchData()
    }).catch(() => {})
}
</script>
