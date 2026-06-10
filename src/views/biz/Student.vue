<template>
  <div class="page">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="学号/姓名/手机号" clearable
            @keyup.enter="handleQuery" style="width:200px" />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="queryForm.classId" placeholder="全部" clearable style="width:180px" @change="handleQuery">
            <el-option v-for="c in classList" :key="c.id" :label="c.className" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="queryForm.keyword='';queryForm.classId=null;handleQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:16px">
      <template #header>
        <div class="card-header">
          <span>学生列表</span>
          <el-button type="primary" @click="openDialog(null)">新增学生</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="70">
          <template #default="{row}">
            {{ row.gender === 1 ? '男' : row.gender === 0 ? '女' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="出生日期" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="classId" label="班级" width="170">
          <template #default="{row}">
            {{ getClassName(row.classId) }}
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentDate" label="入学日期" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{row}">
            <el-tag :type="row.status===1?'success':'danger'">{{ row.status===1?'在读':'休学' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
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
    <el-dialog :title="dialogMode==='add'?'新增学生':'编辑学生'" v-model="dialogVisible" width="550px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="dialogForm.studentNo" />
        </el-form-item>
        <el-form-item label="姓名" prop="studentName">
          <el-input v-model="dialogForm.studentName" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="dialogForm.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-input v-model="birthday" type="date" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="dialogForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="dialogForm.email" />
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="dialogForm.classId" placeholder="请选择班级" style="width:100%">
            <el-option v-for="c in classList" :key="c.id" :label="c.className" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入学日期">
          <el-input v-model="enrollmentDate" type="date" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="家庭住址">
          <el-input v-model="dialogForm.address" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" :active-value="1" :inactive-value="0" active-text="在读" inactive-text="休学" />
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
import * as studentApi from '../../api/student'
import * as classApi from '../../api/class'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const classList = ref([])

const queryForm = reactive({ current: 1, size: 10, keyword: '', classId: null })

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)

// 日期字段独立 ref — el-date-picker 不能绑定 reactive 属性
const birthday = ref('')
const enrollmentDate = ref('')

// 其余用 ref({})
const dialogForm = ref({
  id: null, studentNo: '', studentName: '', gender: 1,
  phone: '', email: '', classId: null, address: '', status: 1
})

const dialogRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }]
}

onMounted(() => {
  fetchData()
  loadClasses()
})

async function loadClasses() {
  try {
    const res = await classApi.getClassList()
    classList.value = res.data
  } catch (e) { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const res = await studentApi.getStudentPage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function getClassName(classId) {
  const c = classList.value.find(c => c.id === classId)
  return c ? c.className : '-'
}

function handleQuery() {
  queryForm.current = 1
  fetchData()
}

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  if (row) {
    dialogForm.value = {
      id: row.id ?? null, studentNo: row.studentNo ?? '', studentName: row.studentName ?? '',
      gender: row.gender ?? 1, phone: row.phone ?? '', email: row.email ?? '',
      classId: row.classId ?? null, address: row.address ?? '', status: row.status ?? 1
    }
    birthday.value = row.birthday ?? ''
    enrollmentDate.value = row.enrollmentDate ?? ''
  } else {
    dialogForm.value = {
      id: null, studentNo: '', studentName: '', gender: 1,
      phone: '', email: '', classId: null, address: '', status: 1
    }
    birthday.value = ''
    enrollmentDate.value = ''
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const data = { ...dialogForm.value, birthday: birthday.value || null, enrollmentDate: enrollmentDate.value || null }
    if (dialogMode.value === 'add') {
      await studentApi.addStudent(data)
    } else {
      await studentApi.updateStudent(data)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除学生「${row.studentName}」？`, '提示', { type: 'warning' })
    .then(async () => {
      await studentApi.deleteStudent(row.id)
      ElMessage.success('删除成功')
      fetchData()
    }).catch(() => {})
}
</script>
