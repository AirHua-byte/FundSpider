<script setup lang="ts">
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { getRules } from '../api/private'
import { Rules } from '../types/types'
import Header from '../components/Header.vue'
import Table from '../components/Table.vue';
import Card from '../components/Card.vue';
import Drawer from '../components/Drawer.vue';

const store = useStore()
const isLogin = computed(() => store.state.isLogin)
const targetData = computed(() => store.getters.targetFund)
const optionData = computed(() => store.getters.optionFund)
const targetLength = computed(() => store.getters.targetLength)
const optionLength = computed(() => store.getters.optionLength)
const rules = computed(() => store.state.rules)
const codeRef = ref('')
const showRef = ref(false)

// let rules: Rules = reactive({
//   FallingOnemonth: '',
//   fallingOneweek: '',
//   risingFromyear: '',
//   risingOnemonth: '',
//   risingOneweek: '',
//   risingOneyear: '',
//   risingSixmonth: '',
//   risingThreemonth: '',
//   risingThreeyear: '',
//   risingTwoyear: '',
//   userName: ''
// })

const getRulesFun = () => {
  if(isLogin.value){
    getRules(store.state.username)
      .then((data: Object) => {
        Object.keys(rules).map(key => {
          rules[key] = data[key]
        })
      })
  }else {
    Object.keys(rules).map(key => {
      rules[key] = ''
    })
  }
}

const changeDrawer = (data) => {
  codeRef.value = data.code
  showRef.value = data.show
}

onMounted(() => {
  store.dispatch('initAction')
})

watch(() => isLogin.value, () => {
  getRulesFun()
})
</script>

<template>
  <Header></Header>
    <el-row>
      <el-col :lg="3" :xs="22" :offset="1">
        <Card :rules="rules"></Card>
      </el-col>
      <el-col :lg="18" :xs="22" :offset="1">
        <Table :tableData="targetData" type="每日定向筛选基金" :length="targetLength" @changeDrawer="changeDrawer"></Table>
        <Table :tableData="optionData" type="每日自选基金情况" :length="optionLength" @changeDrawer="changeDrawer"></Table>
      </el-col>
    </el-row>

  <Drawer :code="codeRef" v-model:show="showRef"></Drawer>
</template>

<style scoped>

</style>