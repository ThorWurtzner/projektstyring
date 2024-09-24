<script setup>
  import { auth, db } from '@/firebase';
  import { signOut } from 'firebase/auth';
  import { addDoc, collection, doc, Firestore, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Project from '@/components/Project.vue';

  const router = useRouter();

  let isAdmin = ref(false);
  let loaded = ref(false);
  let showProjectModal = ref(false);
  let projects = ref([]);

  const projectName = ref("");
  const projectDesc = ref("");

  const taskName = ref("");
  const taskStatus = ref("");
  const userAssigned = ref("");

  async function fetchUserRole() {
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = await userDoc.data();
      isAdmin.value = userData.admin;
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProjects() {
    const q = query(collection(db, 'projects'));

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        projects.value.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    });

    if (projects != null) {
      projects.value.forEach(async (project) => {
        const taskCollection = collection(db, "projects/" + project.id + "/tasks");
        onSnapshot(taskCollection, (taskSnapshot) => {
          project.tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
        })
      });
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      router.push("/");
    } catch(err) {
      console.error(err);
    }
  }
  
  async function createProject() {
    const projectCollection = collection(db, 'projects');
    await addDoc(projectCollection, {
      name: projectName,
      description: projectDesc
    })

    showProjectModal = false;
  }

  async function createTaskForProject(projectId) {
    const tasksCollection = collection(db, "projects/" + projectId + "/tasks");
    await addDoc(tasksCollection, {
      name: taskName,
      status: taskStatus,
      userAssigned: userAssigned
    })
  }
  
  function deleteProject() {
    console.error("Not implemented yet!"); // just do it on name?
  }

  onMounted(async () => {
    await fetchUserRole();
    await fetchProjects();
    loaded.value = true;
  })
</script>

<template>
  <div v-if="!loaded" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid border-opacity-50"></div>
  </div>

  <div v-else class="h-screen">
    <header class="w-full h-20 flex items-center justify-between px-5 shadow-md bg-slate-100">
      <p class="font-semibold text-blue-500">{{ auth.currentUser.email }}
        <span v-if="isAdmin" class="text-orange-700 font-black text-lg">- Admin</span>
      </p>

      <button @click="logout" class="primaryBtn">Logout</button>
    </header>

    <main class="max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col h-full justify-between mx-5 sm:mx-16">
        <div class="flex flex-col flex-grow gap-3 mt-8 overflow-y-scroll">
          <!-- primary content components -->
            <Project v-for="project in projects" :key="project.id" :projectData="project" />
        </div>
      <button v-if="isAdmin" @click="showProjectModal = true" class="bg-blue-600 hover:bg-blue-700 py-4 text-white font-semibold text-xl mt-6 rounded-3xl mb-5 w-full self-center">+ Add new project</button>
      
      <!-- Modal -->
      <div v-if="showProjectModal == true" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
        <div class="bg-white p-5 rounded-lg shadow-lg w-80">
          <form @submit.prevent="createProject" class="flex flex-col gap-3">
            <input v-bind="projectName" type="name" placeholder="Project name" v-model="name" required class="inputField" />
            <input v-bind="projectDesc" type="desc" placeholder="Description" v-model="desc" required class="inputField" />
            <div class="flex justify-between">
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-5">Create project</button>
              <button @click="showProjectModal = false" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-5">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
