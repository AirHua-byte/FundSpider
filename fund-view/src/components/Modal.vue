<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex';
import Form from './Form.vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  dialogVisible: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:dialogVisible'])

const fromRef = ref(null)
const store = useStore()
const tips = computed(() => {
  return props.type === 'login' ? '登录' : '注册'
})

const submit = () => {
  if(fromRef.value){
    fromRef.value.submitForm(fromRef.value.ruleFormRef)
  }
}
const reset = () => {
  if(fromRef.value){
    fromRef.value.resetForm(fromRef.value.ruleFormRef)
  }
}

const handleClose = () => {
  emits('update:dialogVisible', !props.dialogVisible)
}

watch(() => store.getters.isLogin, () => {
  if(store.getters.isLogin){
    emits('update:dialogVisible', false)
  }
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="tips"
    width="30%"
    :before-close="handleClose"
  >
    <Form ref="fromRef" :type="type">
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="submit"
            >确定</el-button
          >
        </span>
      </template>
    </Form>
  </el-dialog>
</template>

<style scoped>

</style>