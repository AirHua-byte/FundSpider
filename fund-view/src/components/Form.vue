<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus';
import type { ElForm } from 'element-plus'
import { useStore } from 'vuex';

type FormInstance = InstanceType<typeof ElForm>
const ruleFormRef = ref<FormInstance>()
const store = useStore()

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const checkUserName = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('用户名不能为空'))
  }
  setTimeout(() => {
    if (value.length >= 2 && value.length <= 15) {
      callback()
    } else {
      callback(new Error('用户名应该在2-15个字符之间'))
    }
  }, 1000)
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (ruleForm.checkPass !== '') {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validateField('checkPass', () => null)
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== ruleForm.pass) {
    callback(new Error("两次密码不一致"))
  } else {
    callback()
  }
}

const ruleForm = reactive({
  pass: '',
  checkPass: '',
  username: '',
})

const rules = reactive({
  username: [{ validator: checkUserName, trigger: 'blur', required: true, }],
  pass: [{ validator: validatePass, trigger: 'blur', required: true }],
  checkPass: [{ validator: validatePass2, trigger: 'blur', required: true, }],
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if(valid){
      if(props.type === 'login'){
        store.dispatch('loginAction', {
          username: ruleForm.username,
          password: ruleForm.pass
        })
      } else {
        store.dispatch('registerAction', {
          username: ruleForm.username,
          password: ruleForm.pass
        })
      }
    }
    return valid
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

defineExpose({
  submitForm,
  resetForm,
  ruleFormRef
})
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    status-icon
    :rules="rules"
    label-width="120px"
    class="demo-ruleForm"
  >
    <el-form-item label="请输入用户名" prop="username">
      <el-input v-model.number="ruleForm.username"></el-input>
    </el-form-item>
    <el-form-item label="请输入密码" prop="pass">
      <el-input
        v-model="ruleForm.pass"
        type="password"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="再次输入密码" prop="checkPass" v-if="type !== 'login'">
      <el-input
        v-model="ruleForm.checkPass"
        type="password"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    
    <el-form-item>
      <slot name="footer"></slot>
    </el-form-item>
  </el-form>
</template>

<style scoped>

</style>