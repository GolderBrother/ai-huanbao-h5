<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/hooks/useTheme'

const userStore = useUserStore()
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <router-view />
</template>

<style lang="scss">
// @import '@/styles/index.scss';
@import './style.css';
</style>