<script setup>
    import { defineProps } from 'vue';

    const props = defineProps({
    projectData: {
        type: Object,
        required: true,
        default: () => ({
            name: "Untitled Project",
            status: "Unknown",
            description: "No description available."
        })
    }
});

</script>

<template>
    <div class="project-card bg-white shadow-md p-8 rounded-3xl border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800">{{ projectData?.name }}</h2>
      <p class="text-gray-600 mt-4">{{ projectData?.description }}</p>
  
      <div class="mt-4 flex justify-between items-center">
        <button class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Tasks</button>
        <button class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Delete</button>
      </div>
    </div>
</template>
  