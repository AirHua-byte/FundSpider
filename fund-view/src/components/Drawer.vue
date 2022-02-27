<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import * as echarts from 'echarts';
import { getStageInfo, getFundInfo, getFundstage } from '../api/public'
import { setData } from '../utils/util'
import { FundInfo } from '../types/types'

type EChartsOption = echarts.EChartsOption;

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  show: {
    type: Boolean
  }
})
const emits = defineEmits(['update:show'])

let dataVal = reactive({
  x: [],
  y: []
})
const drawerRef = ref<boolean>(props.show)
let fundInfo:FundInfo = reactive({
  fundCode: '',
  fundName: '',
  fundNameShort: '',
  fundType: '',
  releaseDate: '',
  buildDate: '',
  assetScale: '',
  shareScale: '',
  administrator: '',
  custodian: '',
  manager: '',
  bonus: '',
  managementRate: '',
  trusteeshipRate: '',
  saleServiceRate: '',
  subscriptionRate: ''
})
let fundRate = reactive([])

let option: EChartsOption;
let chartDom: HTMLElement = null
let myChart = null

const initChart = () => {
  let existInstance = echarts.getInstanceByDom(document.getElementById('container'));
  if (existInstance) {
    echarts.dispose(myChart);
  }
  chartDom = document.getElementById('container')!;
  myChart = echarts.init(chartDom)

  option = {
    // Make gradient line here
    visualMap: [
      {
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        min: -50,
        max: 50
      }
    ],

    title: [
      {
        left: 'center',
        text: '近一年涨跌趋势'
      }
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        data: dataVal.x
      }
    ],
    yAxis: [
      {}
    ],
    grid: [
      {
        // top: '60%'
      }
    ],
    series: [
      {
        type: 'line',
        showSymbol: false,
        data: dataVal.y
      }
    ]
  };
  
  option && myChart.setOption(option);
}

const getData = (code: string) => {
  getStageInfo(code, 'oneyear')
    .then((data: any) => {
      dataVal = setData(data.reverse())
      initChart()
    })
  getFundInfo(code)
    .then(data => {
      Object.keys(fundInfo).map(key => {
        fundInfo[key] = data[key]
      })
    })
  getFundstage(code)
    .then((data: any) => {
      fundRate.push(data.stageAmout)
      fundRate.push(data.averageAmout)
      fundRate.push(data.csiAmout)
      fundRate.map(item => {
        Object.keys(item).map(key => {
          item[key] = item[key] + '%'
        })
      })
      data.stageAmout['tag'] = '阶段涨幅'
      data.averageAmout['tag'] = '同类平均'
      data.csiAmout['tag'] = '沪深300'
    })
}

const go = () => {
  window.location.href = `http://fund.eastmoney.com/${props.code}.html`
}

watch(() => props.code, () => {
  getData(props.code)
})
watch(() => props.show, () => {
  drawerRef.value = props.show
})
watch(() => drawerRef.value, () => {
  emits('update:show', drawerRef.value)
})
</script>

<template>
  <el-drawer
    v-model="drawerRef"
    title="基金信息"
    direction="ltr"
    size="50%"
  >
    <el-scrollbar>
      <h3 style="text-align: center;">{{ fundInfo.fundNameShort }}</h3>
      <div class="info">
        <p>基金代码: {{fundInfo.fundCode}}</p>
        <p>基金全称: {{fundInfo.fundName}}</p>
        <p>基金简称: {{fundInfo.fundNameShort}}</p>
        <p>基金类型: {{fundInfo.fundType}}</p>
        <p>发行日期: {{fundInfo.releaseDate}}</p>
        <p>成立日期/规模: {{fundInfo.buildDate}}</p>
        <p>资产规模: {{fundInfo.assetScale}}</p>
        <p>份额规模: {{fundInfo.shareScale}}</p>
        <p>基金管理人: {{fundInfo.administrator}}</p>
        <p>基金托管人: {{fundInfo.custodian}}</p>
        <p>基金经理人: {{fundInfo.manager}}</p>
        <p>成立来分红: {{fundInfo.bonus}}</p>
        <p>管理费率: {{fundInfo.managementRate}}</p>
        <p>托管费率: {{fundInfo.trusteeshipRate}}</p>
        <p>销售服务费率: {{fundInfo.saleServiceRate}}</p>
        <p>最高认购费率: {{fundInfo.subscriptionRate}}</p>
      </div>

      <el-table
        :data="fundRate"
        :border="true"
        style="width: 90%; margin: 20px 60px;"
      >
        <el-table-column prop="tag" />
        <el-table-column prop="近1周" label="近一月" />
        <el-table-column prop="近1月" label="近一月" />
        <el-table-column prop="近3月" label="近一月" />
        <el-table-column prop="近6月" label="近一月" />
        <el-table-column prop="今年来" label="近一年" />
        <el-table-column prop="近1年" label="近一年" />
        <el-table-column prop="近2年" label="近一月" />
        <el-table-column prop="近3年" label="近一月" />
      </el-table>

      <div id="container" style="width: 100%; height: 300px;"></div>
      <br />

      <el-button size="large" @click="go" class="btn">前往天天基金查看</el-button>
    </el-scrollbar>
    
  </el-drawer>
</template>

<style scoped>
.info {
  margin: 20px 60px;
}
.info p {
  margin: 10px 0;
}
.btn {
  margin: 0 auto;
  text-align: center;
  position: relative;
  left: 50%;
  margin-left: -75px;
}
</style>