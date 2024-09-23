<script setup>
  import { auth } from '@/firebase';

</script>

<template>
  <div >
    <header class="w-full h-20 bg-slate-300 flex items-center px-5">
      <p class="font-semibold">Currently logged in as: <span class="text-blue-500">{{ auth.currentUser.email }}</span></p>
    </header>
  </div>
</template>
