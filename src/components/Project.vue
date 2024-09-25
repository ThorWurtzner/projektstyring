<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
projectData: {
    type: Object,
    required: true
},
isAdmin: {
    type: Boolean,
    required: true
}

});

const emit = defineEmits(['deleteProject', "viewTasks"])

</script>

<template>
    <div class="project-card bg-white shadow-md p-8 rounded-3xl border border-gray-200 w-full max-w-[600px]">
      <h2 class="text-xl font-bold text-gray-800">{{ projectData?.name }}</h2>
      <p class="text-gray-600 mt-4">{{ projectData?.description }}</p>
  
      <div class="mt-4 flex justify-between items-center">
        <button @click="emit('viewTasks', projectData.id, projectData.name)" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Tasks</button>
        <button v-if="isAdmin" @click="emit('deleteProject', projectData.id)" class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Delete</button>
      </div>
    </div>
</template>
  