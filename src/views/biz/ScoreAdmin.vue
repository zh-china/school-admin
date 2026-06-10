<template>
  <div class="page">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="学生">
          <el-select v-model="queryForm.studentId" placeholder="全部" clearable style="width:180px" @change="handleQuery">
            <el-option v-for="s in studentList" :key="s.id" :label="s.studentName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="queryForm.semester" placeholder="如2026春" clearable style="width:130px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="queryForm.subject" placeholder="全部" clearable style="width:120px" @change="handleQuery">
            <el-option v-for="s in subjectOptions" :key="s" :label="s" :value="s" />
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
          <span>成绩列表</span>
          <el-button type="primary" @click="openDialog(null)">新增成绩</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe v-loading="loading" @row-dblclick="openDialog">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="studentName" label="学生" width="100" />
        <el-table-column prop="subject" label="科目" width="90" />
        <el-table-column prop="score" label="分数" width="80" />
        <el-table-column prop="examType" label="考试类型" width="90" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="examDate" label="考试日期" width="120" />
        <el-table-column prop="remark" label="备注" min-width="150" />
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

    <el-dialog :title="dialogMode==='add'?'新增成绩':'编辑成绩'" v-model="dialogVisible" width="500px" @closed="dialogFormRef = null">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="dialogForm.studentId" placeholder="请选择学生" style="width:100%" filterable>
            <el-option v-for="s in studentList" :key="s.id" :label="s.studentName + ' (' + s.studentNo + ')'" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="dialogForm.subject" placeholder="请选择科目" style="width:100%">
            <el-option v-for="s in subjectOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="dialogForm.score" :min="0" :max="300" :precision="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="dialogForm.examType" style="width:100%">
            <el-option v-for="t in examTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="dialogForm.semester" placeholder="如2026春" />
        </el-form-item>
        <el-form-item label="考试日期">
          <el-input v-model="examDate" type="date" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialogForm.remark" type="textarea" />
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
import * as scoreApi from '../../api/score-admin'
import * as studentApi from '../../api/student'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const studentList = ref([])

const subjectOptions = ['语文','数学','英语','物理','化学','生物','政治','历史','地理','体育','音乐','美术','信息技术']
const examTypes = ['月考','期中','期末','模拟考']

const queryForm = reactive({ current: 1, size: 10, studentId: null, semester: '', subject: '' })

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const dialogFormRef = ref(null)

// el-date-picker 必须用独立 ref（不能用 reactive/ref(obj) 包裹，dayjs 会拿到 Proxy）
const examDate = ref('')

// 其余表单字段用 ref({})
const dialogForm = ref({
  id: null,
  studentId: null,
  subject: '',
  score: 0,
  examType: '月考',
  semester: '',
  remark: ''
})

const dialogRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
  examType: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }]
}

onMounted(() => { fetchData(); loadStudents() })

async function loadStudents() {
  try { const res = await studentApi.getStudentPage({ current: 1, size: 200 }); studentList.value = res.data.records } catch (e) {}
}

async function fetchData() {
  loading.value = true
  try { const res = await scoreApi.getScorePage(queryForm); tableData.value = res.data.records; total.value = res.data.total }
  finally { loading.value = false }
}

function handleQuery() { queryForm.current = 1; fetchData() }
function resetQuery() { queryForm.studentId = null; queryForm.semester = ''; queryForm.subject = ''; handleQuery() }

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'add'
  if (row) {
    dialogForm.value = {
      id: row.id ?? null, studentId: row.studentId ?? null,
      subject: row.subject ?? '', score: row.score ?? 0,
      examType: row.examType ?? '月考', semester: row.semester ?? '',
      remark: row.remark ?? ''
    }
    examDate.value = row.examDate ?? ''
  } else {
    dialogForm.value = {
      id: null, studentId: null, subject: '', score: 0,
      examType: '月考', semester: '', remark: ''
    }
    examDate.value = ''
  }
  dialogVisible.value = true
  dialogFormRef.value?.clearValidate()
}

async function handleSave() {
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await (dialogMode.value === 'add'
      ? scoreApi.addScore({ ...dialogForm.value, examDate: examDate.value || null })
      : scoreApi.updateScore({ ...dialogForm.value, examDate: examDate.value || null }))
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } finally { saving.value = false }
}

function handleDelete(row) {
  ElMessageBox.confirm('确定删除该成绩记录？', '提示', { type: 'warning' })
    .then(async () => { await scoreApi.deleteScore(row.id); ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}
</script>
