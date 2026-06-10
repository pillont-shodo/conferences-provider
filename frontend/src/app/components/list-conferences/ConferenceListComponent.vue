<script setup lang="ts">
import type { Conference } from '../../../domain/conferences/Conference'

defineProps<{ conferences: Conference[] }>()
</script>

<template>
  <ul class="divide-y divide-gray-100">
    <li
      v-for="conference in conferences"
      :key="conference.name"
      class="py-3 px-4 text-gray-800"
    >
      {{ conference.name }}
    </li>
  </ul>
</template>
