<script setup lang="ts">
import { PropType, reactive, ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { useStore } from 'vuex';
import { FormInstance, Rules } from '../types/types'

const props =  defineProps({
  rules: {
    type: Object as PropType<Rules>
  }
})

const checkRules = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('不能为空'))
  }
  setTimeout(() => {
    if (value.toString().match(/^-?[1-9]\d*|0$/)) {
      callback()
    } else {
      callback(new Error('请输入数字'))
    }
  }, 1000)
}

const checkCode = (rule: any, value: string, callback: any) => {
  if(!value){
    return callback()
  }
  setTimeout(() => {
    if (value.toString().match(/^-?[0-9]\d*$/) && value.length === 6) {
      callback()
    } else {
      callback(new Error('请检查是否输入正确'))
    }
  }, 100)
}

const checkemail = (rule: any, value: string, callback: any) => {
  if(!value){
    return callback()
  }
  setTimeout(() => {
    if (value.toString().match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
      callback()
    } else {
      callback(new Error('请检查邮箱格式是否正确'))
    }
  }, 100)
}

const table = ref(false)
const option = ref(false)
const subscribe = ref(false)
const labelPosition = ref('right')
const formEl = ref(null)
const formFl = ref(null)
const formSl = ref(null)
const store = useStore()
const isSubscribe = computed(() => store.getters.isSubscribe)

// const formLabelAlign:Rules = reactive(props.rules)
const validateTrend = [{ validator: checkRules, trigger: 'blur', required: true, }]
const rulesForm = reactive({
  FallingOnemonth: validateTrend,
  fallingOneweek: validateTrend,
  risingFromyear: validateTrend,
  risingOnemonth: validateTrend,
  risingOneweek: validateTrend,
  risingOneyear: validateTrend,
  risingSixmonth: validateTrend,
  risingThreemonth: validateTrend,
  risingThreeyear: validateTrend,
  risingTwoyear: validateTrend
})
const fund = reactive({
  fundCode: ''
})
const email = reactive({
  emailCode: ''
})
const rulesFormCode = reactive({
  fundCode: [{ validator: checkCode, trigger: 'blur', }]
})
const rulesEmailCode = reactive({
  emailCode: [{ validator: checkemail, trigger: 'blur', }]
})

const submitRules = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if(valid){
      const targetRules = {
        RisingFund: {
          oneweek: Number(props.rules.risingOneweek),
          onemonth: Number(props.rules.risingOnemonth),
          threemonth: Number(props.rules.risingThreemonth),
          sixmonth: Number(props.rules.risingSixmonth),
          oneyear: Number(props.rules.risingOneyear),
          threeyear: Number(props.rules.risingThreeyear),
        },
        FallingFund: {
          oneweek: Number(props.rules.fallingOneweek),
          onemonth: Number(props.rules.FallingOnemonth),
        }
      }
      store.dispatch('setRulesAction', targetRules)
      table.value = false
    }else{
      ElNotification.warning({
        title: 'Warning',
        message: '请检查是否正确填写',
        offset: 100,
      })
    }
    return valid
  })
}

const resetRules = (formEl: FormInstance | undefined) => {
  if(!formEl) return
  formEl.resetFields()
}

const submitCode = (formEl: FormInstance | undefined) => {
  if(!formEl) return
  formEl.validate((valid) => {
    if(valid) {
      store.dispatch('setCodeAction', fund.fundCode)
      option.value = false
    }else{
      ElNotification.warning({
        title: 'Warning',
        message: '请检查是否填写正确',
        offset: 100,
      })
    }
  })
}
const submitEmail = (formEl: FormInstance | undefined) => {
  if(!formEl) return
  formEl.validate((valid) => {
    if(valid) {
      store.dispatch('setEmailAction', email.emailCode)
      subscribe.value = false
    }else{
      ElNotification.warning({
        title: 'Warning',
        message: '邮箱格式不正确',
        offset: 100,
      })
    }
  })
}

const handlerSubscribe = () => {
  if(isSubscribe.value){
    store.dispatch('unSubscribeAction')
  }else{
    subscribe.value = true
  }
}

</script>

<template>
  <div class="cards">
    <el-card shadow="hover" class="card" @click="table = true"> 自定义爬取规则 </el-card>
    <el-card shadow="hover" class="card" @click="option = true"> 加入自选基金 </el-card>
    <el-card shadow="hover" class="card" @click="handlerSubscribe"> {{ isSubscribe ? '取消订阅日报' : '订阅基金日报' }} </el-card>
  </div>
  <div class="infos">
    <h3 style="text-align: center;">其他项目和联系</h3>
    <div class="info">
      <div class="box">
        <a href="https://space.bilibili.com/450443708">
          <svg t="1645700329229" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2582" width="32" height="32"><path d="M711.7824 385.706667H317.860978c-11.963733 0-22.038756 9.12384-22.038756 21.379982v261.158684c0 12.255004 10.073884 21.251413 22.038756 21.251414h393.921422c11.964871 0 20.946489-8.995271 20.946489-21.251414V407.086649c0-12.25728-8.983893-21.379982-20.946489-21.379982z m-367.101724 96.493795l111.015253-21.255964 8.388835 41.665422-109.899093 21.253689-9.504995-41.663147z m171.137706 126.95552c-34.116267 37.19168-69.907342-11.744142-69.907342-11.744142l18.176-11.744142s24.327964 43.902293 51.453724-14.262045c26.006187 56.486116 54.809031 14.821831 54.809032 15.099449l16.500053 10.62912c-0.002276-0.003413-30.762098 49.212302-71.031467 12.02176z m164.706987-85.291235l-110.176711-21.251414 8.669866-41.66656 110.73536 21.255965-9.228515 41.662009z" p-id="2583"></path><path d="M512 115.456c-219.005156 0-396.544 177.539982-396.544 396.542862 0 219.005156 177.539982 396.545138 396.544 396.545138S908.544 731.004018 908.544 512c0-219.005156-177.538844-396.544-396.544-396.544z m208.828871 626.904178c-27.71968-0.877227-37.05856 0-37.05856 0s-2.042311 31.806578-29.177173 32.38912c-27.428409 0.291271-31.514169-22.177564-32.391396-30.63808-16.630898 0-216.512284 0.873813-216.512284 0.873813s-3.500942 29.47072-30.63808 29.47072c-27.428409 0-28.889316-24.511147-30.63808-29.47072-17.801671 0-41.729138-0.584818-41.729138-0.584818s-60.109938-12.541724-67.987911-90.744604c0.874951-78.201742 0-232.8576 0-232.8576s-5.544391-72.071396 66.239147-92.790329c22.173013-0.873813 70.03136-1.16736 125.471857-1.16736l-51.065742-49.605973s-7.877973-9.921422 5.544391-21.009067c13.717049-11.086507 14.296178-6.568391 18.966756-3.35872 4.66944 3.208533 76.160569 73.672249 76.160569 73.672249h-9.629014c27.427271 0 55.732907 0.444871 82.868907 0.444871 10.502827-10.505102 70.322631-69.082453 74.407253-71.99744 4.668302-2.9184 5.542116-7.841564 18.967894 3.244942 13.422364 11.087644 5.543253 21.028409 5.543253 21.028409l-49.898382 48.155307c68.572729 0.584818 121.387236 0.878364 121.387235 0.878364s67.694364 14.885547 69.446543 92.500196c-0.874951 77.6192 0.291271 233.732551 0.291271 233.732551s-3.7888 75.867022-68.569316 87.834169z" p-id="2584"></path></svg>
        </a>
      </div>
      <div class="box">
        <a href="https://huabyte.com/">
          <svg t="1645700478523" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8530" width="32" height="32"><path d="M419.2 451.2h89.6c16 0 32-12.8 32-32 0-16-12.8-32-32-32h-89.6c-16 0-32 12.8-32 32 3.2 16 16 32 32 32zM601.6 572.8h-182.4c-16 0-32 12.8-32 32 0 16 12.8 32 32 32h182.4c16 0 32-12.8 32-32s-12.8-32-32-32z" fill="#2c2c2c" p-id="8531"></path><path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m252.8 608c0 89.6-73.6 160-163.2 160H416c-86.4 0-160-73.6-160-160v-188.8C256 329.6 329.6 256 419.2 256h112c48 0 102.4 41.6 124.8 89.6 6.4 12.8 9.6 22.4 16 54.4 3.2 19.2 3.2 35.2 12.8 44.8 12.8 12.8 57.6 6.4 70.4 9.6 12.8 6.4 12.8 22.4 12.8 22.4l-3.2 131.2z" fill="#2c2c2c" p-id="8532"></path></svg>
        </a>
      </div>
      <div class="box">
        <a href="https://music.huabyte.com/">
          <svg t="1645700419549" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5521" width="32" height="32"><path d="M304 665.6a22.4 22.4 0 1 0 44.8 0 22.4 22.4 0 1 0-44.8 0z m275.2-48a22.4 22.4 0 1 0 44.8 0 22.4 22.4 0 1 0-44.8 0z" p-id="5522"></path><path d="M512 32C246.4 32 32 246.4 32 512s214.4 480 480 480 480-214.4 480-480S777.6 32 512 32z m176 585.6c0 51.2-38.4 89.6-86.4 89.6-48 0-86.4-38.4-86.4-86.4s38.4-86.4 86.4-86.4c9.6 0 16 0 22.4 3.2v-99.2L412.8 480v188.8c0 48-38.4 86.4-86.4 86.4-48 0-86.4-38.4-86.4-86.4s38.4-86.4 86.4-86.4c9.6 0 16 0 22.4 3.2V371.2c0-25.6 19.2-51.2 48-57.6l208-48c25.6-6.4 48 0 64 12.8C681.6 288 688 304 688 320v297.6z" p-id="5523"></path><path d="M412.8 371.2v41.6L624 368v-44.8h-6.4l-204.8 48z" p-id="5524"></path></svg>
        </a>
      </div>
      <div class="box">
        <a href="https://github.com/AirHua-byte">
          <svg t="1645700244560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2052" width="32" height="32"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" p-id="2053"></path></svg>
        </a>
      </div>
    </div>
  </div>
  <el-drawer
    v-model="table"
    title="爬取规则"
    direction="rtl"
    size="30%"
  >
    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="rules"
      size="large"
      :rules="rulesForm"
      ref="formEl"
    >
      <h3 style="text-align: center;">爬取涨幅规则 &gt; (单位:%)</h3>
      <br />
      <el-form-item label="近一周" prop="risingOneweek">
        <el-input v-model="rules.risingOneweek"></el-input>
      </el-form-item>
      <el-form-item label="近一月" prop="risingOnemonth">
        <el-input v-model="rules.risingOnemonth"></el-input>
      </el-form-item>
      <el-form-item label="近三月" prop="risingThreemonth">
        <el-input v-model="rules.risingThreemonth"></el-input>
      </el-form-item>
      <el-form-item label="近六月" prop="risingSixmonth">
        <el-input v-model="rules.risingSixmonth"></el-input>
      </el-form-item>
      <el-form-item label="近一年" prop="risingOneyear">
        <el-input v-model="rules.risingOneyear"></el-input>
      </el-form-item>
      <el-form-item label="近三年" prop="risingThreeyear">
        <el-input v-model="rules.risingThreeyear"></el-input>
      </el-form-item>

      <h3 style="text-align: center;">爬取下跌规则 &lt; (单位:%)</h3>
      <br />
      <el-form-item label="近一周" prop="fallingOneweek">
        <el-input v-model="rules.fallingOneweek"></el-input>
      </el-form-item>
      <el-form-item label="近一月" prop="FallingOnemonth">
        <el-input v-model="rules.FallingOnemonth"></el-input>
      </el-form-item>
    </el-form>

    <div class="footer">
      <el-button size="large" color="#626aef" plain @click="resetRules(formEl)">重置</el-button>
      <el-button size="large" color="#626aef" style="color: white" @click="submitRules(formEl)">提交</el-button>
    </div>
  </el-drawer>
  
  <el-drawer
    v-model="option"
    title="加入自选"
    direction="rtl"
    size="30%"
  >
    <h3 style="text-align: center;">填入基金代码</h3>
    <br />
    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="fund"
      size="large"
      :rules="rulesFormCode"
      ref="formFl"
    >
      <el-form-item label="基金代码" prop="fundCode">
        <el-input v-model="fund.fundCode"></el-input>
      </el-form-item>
    </el-form>

    <div class="footer">
      <el-button size="large" color="#626aef" plain @click="resetRules(formFl)">重置</el-button>
      <el-button size="large" color="#626aef" style="color: white" @click="submitCode(formFl)">提交</el-button>
    </div>
  </el-drawer>

  <el-drawer
    v-model="subscribe"
    title="报表订阅"
    direction="rtl"
    size="30%"
  >
    <h3 style="text-align: center;">填写收件邮箱</h3>
    <br />
    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="email"
      size="large"
      :rules="rulesEmailCode"
      ref="formSl"
    >
      <el-form-item label="邮箱号" prop="emailCode">
        <el-input v-model="email.emailCode"></el-input>
      </el-form-item>
    </el-form>

    <div class="footer">
      <el-button size="large" color="#626aef" plain @click="resetRules(formSl)">重置</el-button>
      <el-button size="large" color="#626aef" style="color: white" @click="submitEmail(formSl)">提交</el-button>
    </div>
  </el-drawer>
</template>

<style scoped>
.cards {
  margin-top: 165px;
}
.card {
  cursor: pointer;
  margin: 20px 10px;
}
.card:hover {
  background-color: #0d3f67;
  color: #f2f4f6;
}
.footer{
  margin-top: 40px;
  text-align: center;
}
.infos{
  margin-top: 225px;
}
.info{
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.box{
  border-radius: 10%;
  margin: 20px;
  background-color: #eee;
  display: flex;
  align-items: center;
}
.box svg {
  margin: 6px 6px 3px 6px;
  text-align: center;
  border-radius: 10%;
  width: 2rem;
  height: 2rem;
  filter: grayscale(100%);
  filter: gray;
}
@media screen and (max-width: 1000px){
  .infos{
    margin-top: 20px;
  }
}
</style>