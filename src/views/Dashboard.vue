<template>
  <div class="dashboard">
    <!-- 概览卡片 -->
    <div class="stat-cards">
      <div class="stat-card card-blue">
        <div class="card-icon">
          <el-icon :size="28"><UserFilled /></el-icon>
        </div>
        <div class="card-body">
          <div class="card-value"><span ref="countEl1">{{ animated[0] }}</span></div>
          <div class="card-label">学生总数</div>
        </div>
        <div class="card-bg-icon">👥</div>
      </div>
      <div class="stat-card card-green">
        <div class="card-icon">
          <el-icon :size="28"><OfficeBuilding /></el-icon>
        </div>
        <div class="card-body">
          <div class="card-value">{{ animated[1] }}</div>
          <div class="card-label">班级总数</div>
        </div>
        <div class="card-bg-icon">🏫</div>
      </div>
      <div class="stat-card card-purple">
        <div class="card-icon">
          <el-icon :size="28"><TrendCharts /></el-icon>
        </div>
        <div class="card-body">
          <div class="card-value">{{ overview.avgScore || '-' }}</div>
          <div class="card-label">全校平均分</div>
        </div>
        <div class="card-bg-icon">📊</div>
      </div>
      <div class="stat-card card-orange">
        <div class="card-icon">
          <el-icon :size="28"><TrophyBase /></el-icon>
        </div>
        <div class="card-body">
          <div class="card-value">{{ overview.excellentRate || '0' }}%</div>
          <div class="card-label">优秀率 (≥90分)</div>
        </div>
        <div class="card-bg-icon">🏆</div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="charts-grid">
      <!-- 班级平均分柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>📊 各班平均分对比</h3>
          <el-select v-model="avgSemester" placeholder="学期" size="small" style="width:140px" @change="loadClassAvg">
            <el-option v-for="s in semesters" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
        <div class="chart-body">
          <v-chart v-if="classAvgOption" :option="classAvgOption" autoresize style="height:320px" />
          <el-empty v-else description="暂无数据" :image-size="60" />
        </div>
      </div>

      <!-- 成绩分布饼图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>🎯 成绩分布</h3>
          <div style="display:flex; gap:8px">
            <el-select v-model="distSemester" placeholder="学期" size="small" style="width:130px" @change="loadDistribution">
              <el-option v-for="s in semesters" :key="s" :label="s" :value="s" />
            </el-select>
            <el-select v-model="distSubject" placeholder="全部科目" size="small" style="width:120px" @change="loadDistribution" clearable>
              <el-option v-for="s in subjects" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
        </div>
        <div class="chart-body">
          <v-chart v-if="distOption" :option="distOption" autoresize style="height:320px" />
          <el-empty v-else description="暂无数据" :image-size="60" />
        </div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="chart-card" style="margin-top:20px">
      <div class="chart-header">
        <h3>📈 成绩趋势</h3>
        <el-select v-model="trendSemester" placeholder="学期" size="small" style="width:140px" @change="loadTrend">
          <el-option v-for="s in semesters" :key="s" :label="s" :value="s" />
        </el-select>
      </div>
      <div class="chart-body">
        <v-chart v-if="trendOption" :option="trendOption" autoresize style="height:300px" />
        <el-empty v-else description="暂无数据" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOverview, getClassAvg, getDistribution, getTrend } from '../api/stats'

// 概览
const overview = reactive({})
const semesters = ref([])
const subjects = ref([])

// 数字动画
const animated = reactive([0, 0, 0, 0])

function animateValue(idx, target) {
  const start = 0
  const duration = 1000
  const startTime = performance.now()
  function step(ts) {
    const elapsed = ts - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animated[idx] = Math.round(start + (target - start) * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// 班级平均分图表
const avgSemester = ref('')
const classAvgOption = ref(null)
async function loadClassAvg() {
  const res = await getClassAvg(avgSemester.value || undefined)
  const data = res.data || []
  if (!data.length) { classAvgOption.value = null; return }
  classAvgOption.value = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.className), axisLabel: { rotate: 20 } },
    yAxis: { type: 'value', name: '平均分', min: 0, max: 100 },
    series: [{
      type: 'bar', data: data.map(d => Number(d.avgScore)),
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }] }
      },
      barWidth: '40%',
      label: { show: true, position: 'top', color: '#333', fontWeight: 'bold' }
    }]
  }
}

// 成绩分布饼图
const distSemester = ref('')
const distSubject = ref('')
const distOption = ref(null)
async function loadDistribution() {
  const res = await getDistribution(distSemester.value || undefined, distSubject.value || undefined)
  const data = res.data || []
  if (!data.length || data.every(d => d.count === 0)) { distOption.value = null; return }
  distOption.value = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['45%', '75%'], center: ['50%', '48%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: data.map((d, i) => ({
        value: d.count, name: d.range,
        itemStyle: { color: ['#fc5c65','#fd9644','#fed330','#26de81','#45aaf2'][i] }
      }))
    }]
  }
}

// 趋势图
const trendSemester = ref('')
const trendOption = ref(null)
async function loadTrend() {
  const res = await getTrend(trendSemester.value || undefined)
  const data = res.data || []
  if (!data.length) { trendOption.value = null; return }
  trendOption.value = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.examType) },
    yAxis: { type: 'value', name: '平均分', min: 0, max: 100 },
    series: [{
      type: 'line', data: data.map(d => Number(d.avgScore)),
      smooth: true, symbol: 'circle', symbolSize: 10,
      lineStyle: { width: 3, color: '#667eea' },
      itemStyle: { color: '#764ba2' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: 'rgba(102,126,234,0.3)' }, { offset: 1, color: 'rgba(102,126,234,0.02)' }] } },
      label: { show: true, color: '#333', fontWeight: 'bold' }
    }]
  }
}

onMounted(async () => {
  try {
    const res = await getOverview()
    Object.assign(overview, res.data || {})
    if (res.data?.semesters) semesters.value = res.data.semesters
    if (res.data?.subjects) subjects.value = res.data.subjects
    if (semesters.value.length) {
      avgSemester.value = semesters.value[0]
      distSemester.value = semesters.value[0]
      trendSemester.value = semesters.value[0]
    }
    // 数字动画
    if (overview.studentCount) animateValue(0, Number(overview.studentCount))
    if (overview.classCount) animateValue(1, Number(overview.classCount))
    // 加载图表
    loadClassAvg()
    loadDistribution()
    loadTrend()
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }

/* ── 概览卡片 ── */
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-card {
  border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px;
  position: relative; overflow: hidden; cursor: default;
  transition: all 0.3s ease; color: #fff;
}
.stat-card:hover { transform: translateY(-3px); }
.stat-card .card-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
}
.card-body { flex: 1; }
.card-value { font-size: 30px; font-weight: 700; line-height: 1.2; }
.card-label { font-size: 13px; opacity: 0.85; margin-top: 2px; }
.card-bg-icon {
  position: absolute; right: -10px; bottom: -10px; font-size: 64px; opacity: 0.15;
}
.card-blue { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.card-green { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.card-purple { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.card-orange { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

/* ── 图表 ── */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-card {
  background: #fff; border-radius: 16px; padding: 20px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}
.chart-card:hover { box-shadow: 0 4px 24px rgba(102,126,234,0.1); }
.chart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.chart-header h3 { font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0; }
.chart-body { min-height: 320px; display: flex; align-items: center; justify-content: center; }

@media (max-width: 900px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
