<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './Modal.vue';
import { useStore } from 'vuex';

const dialogVisible = ref(false)
const type = ref('')
const store = useStore()
const username = computed(() => store.state.username)
const isLogin = computed(() => store.getters.isLogin)

const login = () => {
  dialogVisible.value = true
  type.value = 'login'
}
const register = () => {
  dialogVisible.value = true
  type.value = 'register'
}
const logout = () => {
  store.dispatch('logoutAction')
}
</script>

<template>
  <el-row class="header">
    <el-col :span="4" :offset="2">
      <h3 style="color: #f2f4f6;">基金定向筛选工具</h3>
    </el-col>
    <!-- <el-col :span="12"></el-col> -->
    <el-col :span="4" :offset="12">
      <template v-if="!isLogin">
        <el-button round @click="login">登录</el-button>
        <el-button round @click="register">注册</el-button>
      </template>
      <template v-else>
        <span class="user">{{ username }}</span>
        <el-button round @click="logout" style="margin: 5px 0;">退出登录</el-button>
      </template>
    </el-col>
  </el-row>

  <Modal :type="type" v-model:dialogVisible="dialogVisible"></Modal>
</template>

<style scoped>
.header{
  background-color: #0d3f67;
  display: flex;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  align-items: center;
  padding: 15px;
  z-index: 1000;
}
.user {
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid #6b48ff;
  color: #f2f4f6;
  margin: 5px 10px;
}
</style>