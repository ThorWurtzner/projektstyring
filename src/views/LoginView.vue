<script setup>
  import { ref } from 'vue';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '@/firebase';
  import { useRouter } from 'vue-router';
  
  const email = ref("");
  const password = ref("");
  const errorMessage = ref("");
  const modalVisible = ref(false);

  const router = useRouter();

  async function login() {
    errorMessage.value = ""; // To check if error on each attempt
    try {
      let loginCredential = await signInWithEmailAndPassword(auth, email.value, password.value) 

      if (loginCredential) {
        router.push("/dashboard");
      }

    } catch(err) {
      console.error(err);
      errorMessage.value = "Invalid credentials, try again.";
      email.value = "";
      password.value = "";
    }
  }
</script>

<template>
  <div class="h-screen grid place-items-center">
    <form @submit.prevent="login" class="relative w-96 max-w-full h-96 bg-slate-100 rounded-e-3xl flex flex-col justify-center gap-5 p-10 shadow-lg">
      <div @click="modalVisible = true" class="absolute right-10 top-11 bg-slate-200 border-2 border-slate-400 w-10 h-10 rounded-full text-xs opacity-60 font-semibold grid place-items-center hover:bg-slate-400 transition-colors cursor-pointer">Hint</div>
      
      <h1 class="font-bold text-2xl mb-5 text-blue-400">Login | Projektstyring</h1>
      <input type="email" placeholder="Email" v-model="email" required class="inputField" />
      <input type="password" placeholder="Password" v-model="password" required class="inputField" />
      <!-- Shows error message on invalid login -->
      <p class="text-red-500 h-5">{{ errorMessage }}</p>
      <button type="submit" class="w-full 0 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold">Login</button>
    </form>
  </div>

   <!-- Modal -->
   <div v-if="modalVisible == true" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div class="bg-white p-5 rounded-lg shadow-lg w-80">
        <h2 class="text-xl font-bold mb-3">Hint</h2>
        <p class="mb-3">Psst... the available user logins are:</p>
        <div class="bg-blue-50 p-3 rounded-md shadow-inner">
          <p><span class="font-semibold">Email:</span> jensen@mail.dk</p>
          <p><span class="font-semibold">Passw:</span> citron</p>
        </div>
        <div class="bg-blue-50 p-3 rounded-md shadow-inner mt-3">
          <p><span class="font-semibold">Email:</span> hansen@mail.dk</p>
          <p><span class="font-semibold">Passw:</span> appelsin</p>
        </div>
        <button @click="modalVisible = false" class="primaryBtn mt-5">Close</button>
      </div>
    </div>
</template>