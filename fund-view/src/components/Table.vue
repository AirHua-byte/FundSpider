<script setup lang="ts">
import { PropType, ref, reactive, watch, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { TargetFund } from '../types/types'

const props = defineProps({
  tableData: {
    type: Array as PropType<TargetFund[]>
  },
  type: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    default: false
  }
})

const emits =  defineEmits(['changeDrawer'])

const label = ref(props.type === '每日定向筛选基金' ? '近一周涨跌幅' : '每日涨跌幅')
const loading = ref(true)
const currentPage = ref(1)
const store = useStore()

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
const handleClick = (scope) => {
  emits('changeDrawer', {
    code: scope.row.code,
    show: true
  })
}
const addOptionCode = (scope) => {
  const fundCode = scope.row.code
  store.dispatch('setCodeAction', fundCode)
}
const removeOptionCode = (scope) => {
  const fundCode = scope.row.code
  store.dispatch('removeCodeAction', fundCode)
}

const data = computed(() => {
  return props.tableData.filter((item, index) => {
    return index >= (currentPage.value - 1) * 5 && index < currentPage.value * 5
  })
})

watch(() => data.value, () => {
  loading.value = false
})

onMounted(() => {
  if(!store.state.isLogin){
    loading.value = false
  }
})
</script>

<template>
  <h1 class="title">{{type}} ({{length}})</h1>
  <el-table :data="data" style="width: 100%" class="table" v-loading="loading">
    <el-table-column fixed prop="fundName" label="基金名称" width="360" />
    <el-table-column prop="code" label="基金代码" width="240" />
    <el-table-column prop="assetScale" label="基金规模" width="400" />
    <el-table-column prop="Trend" :label="label" width="180" />
    <el-table-column fixed="right" label="操作" width="180">
      <template #default="scope">
        <el-button type="text" size="small" @click="handleClick(scope)">查看详情</el-button>
        <el-button type="text" size="small" v-if="type === '每日定向筛选基金'" @click="addOptionCode(scope)">加入自选</el-button>
        <el-button type="text" size="small" v-else @click="removeOptionCode(scope)">取消自选</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    background 
    layout="prev, pager, next" 
    hide-on-single-page 
    :total="length" 
    :page-size="5"
    class="pagination"
    @current-change="handleCurrentChange"
  >
  </el-pagination>

  
</template>

<style scoped>
.title{
  margin-left: 20px;
  margin-top: 100px;
}
.table {
  margin-top: 20px;
  border: 5px solid #f2f4f6;
  border-radius: 20px;
}
.pagination{
  margin-top: 10px;
  margin-left: 20px;
}
</style>