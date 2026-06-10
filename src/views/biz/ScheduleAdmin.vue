<template>
  <div class="page">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="班级">
          <el-select v-model="queryForm.classId" placeholder="全部" clearable style="width:180px" @change="handleQuery">
            <el-option v-for="c in classList" :key="c.id" :label="c.className" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="queryForm.semester" placeholder="如2026春" clearable style="width:130px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="星期">
          <el-select v-model="queryForm.dayOfWeek" placeholder="全部" clearable style="width:100px" @change="handleQuery">
            <el-option v-for="d in weekOptions" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:16px">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button type="primary" @click="openDialog(null)">新增课程</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="dayOfWeek" label="星期" width="70">
          <template #default="{row}">{{ weekMap[row.dayOfWeek] }}</template>
        </el-table-column>
        <el-table-column prop="period" label="节次" width="70" />
        <el-table-column prop="subject" label="科目" width="100" />
        <el-table-column prop="teacherName" label="授课老师" width="100" />
        <el-table-column label="时间" width="160">
          <template #default="{row}">{{ row.startTime?.substring(0,5) }} - {{ row.endTime?.substring(0,5) }}</template>
        </el-table-column>
        <el-table-column prop="classroom" label="教室" width="120" />
        <el-table-column prop="semester" label="学期" width="90" />
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

    <el-dialog :title="dialogMode==='add'?'新增课程':'编辑课程'" v-model="dialogVisible" width="500px" @closed="dialogFormRef = null">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="班级" prop="classId">
          <el-select v-model="dialogForm.classId" placeholder="请选择班级" style="width:100%">
            <el-option v-for="c in classList" :key="c.id" :label="c.className" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="dialogForm.subject" placeholder="请选择科目" style="width:100%">
            <el-option v-for="s in subjectOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课老师">
          <el-input v-model="dialogForm.teacherName" />
        </el-form-item>
        <el-form-item label="星期" prop="dayOfWeek">
          <el-select v-model="dialogForm.dayOfWeek" style="width:100%">
            <el-option v-for="d in weekOptions" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="节次" prop="period">
          <el-select v-model="dialogForm.period" style="width:100%">
            <el-option v-for="p in 8" :key="p" :label="'第' + p + '节'" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="上课时间">
          <el-input v-model="startTime" type="time" placeholder="开始" style="width:100%" />
        </el-form-item>
        <el-form-item label="下课时间">
          <el-input v-model="endTime" type="time" placeholder="结束" style="width:100%" />
        </el-form-item>
        <el-form-item label="教室">
          <el-input v-model="dialogForm.classroom" />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="dialogForm.semester" placeholder="如2026春" />
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
import * as scheduleApi from '../../api/schedule-admin'
import * as classApi from '../../api/class'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const classList = ref([])

const weekOptions = [
  { label: '周一', value: 1 }, { label: '周二', value: 2 }, { label: '周三', value: 3 },
  { label: '周四', value: 4 }, { label: '周五', value: 5 }, { label: '周六', value: 6 }, { label: '周日', value: 7 }
]
const weekMap = { 1:'周一',2:'周二',3:'周三',4:'周四',5:'周五',6:'周六',7:'周日' }
const subjectOptions = ['语文','数学','英语','物理','化学','生物','政治','历史','地理','体育','音乐','美术','信息技术','班会','自习']

const queryForm = reactive({ current: 1, size: 10, classId: null, semester: '', dayOfWeek: null })

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)

// el-time-picker 必须用独立 ref
const startTime = ref('')
const endTime = ref('')

// 其余字段用 ref({})
const dialogForm = ref({
  id: null, classId: null, subject: '', teacherName: '',
  dayOfWeek: 1, period: 1, classroom: '', semester: ''
})

const dialogRules = {
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  dayOfWeek: [{ required: true, message: '请选择星期', trigger: 'change' }],
  period: [{ required: true, message: '请选择节次', trigger: 'change' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }]
}

onMounted(() => { fetchData(); loadClasses() })

async function loadClasses() {
  try { const res = await classApi.getClassList(); classList.value = res.data } catch (e) {}
}

async function fetchData() {
  loading.value = true
  try { const res = await scheduleApi.getSchedulePage(queryForm); tableData.value = res.data.records; total.value = res.data.total }
  finally { loading.value = false }
}

function handleQuery() { queryForm.current = 1; fetchData() }
function resetQuery() { queryForm.classId = null; queryForm.semester = ''; queryForm.dayOfWeek = null; handleQuery() }

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  if (row) {
    dialogForm.value = {
      id: row.id ?? null, classId: row.classId ?? null,
      subject: row.subject ?? '', teacherName: row.teacherName ?? '',
      dayOfWeek: row.dayOfWeek ?? 1, period: row.period ?? 1,
      classroom: row.classroom ?? '', semester: row.semester ?? ''
    }
    startTime.value = (row.startTime || '').substring(0, 5)
    endTime.value = (row.endTime || '').substring(0, 5)
  } else {
    dialogForm.value = {
      id: null, classId: null, subject: '', teacherName: '',
      dayOfWeek: 1, period: 1, classroom: '', semester: ''
    }
    startTime.value = ''
    endTime.value = ''
  }
  dialogVisible.value = true
  dialogFormRef.value?.clearValidate()
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const data = { ...dialogForm.value, startTime: startTime.value ? startTime.value + ':00' : null, endTime: endTime.value ? endTime.value + ':00' : null }
    if (dialogMode.value === 'add') await scheduleApi.addSchedule(data)
    else await scheduleApi.updateSchedule(data)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally { saving.value = false }
}

function handleDelete(row) {
  ElMessageBox.confirm('确定删除该课程？', '提示', { type: 'warning' })
    .then(async () => { await scheduleApi.deleteSchedule(row.id); ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}
</script>
