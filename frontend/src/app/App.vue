<script setup lang="ts">
import { ref } from 'vue';
import ConferenceListComponent from './components/list-conferences/ConferenceListComponent.vue'
import { useListConferences } from './components/list-conferences/UseListConferences.ts'

const toto = ref(0)
const term= ref('')
const list = useListConferences(term)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto py-10 px-4">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Conférences</h1>
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Rechercher une conférence..."
            class="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
            @input="(e) => term = (e.target as HTMLInputElement).value"
          />
        </div>
        <ConferenceListComponent :conferences="list" />
      </div>
    </div>
  </div>
  
  <button
    class="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    @click="toto++"
    >
    ici : {{ toto }}
    </button>
</template>   

