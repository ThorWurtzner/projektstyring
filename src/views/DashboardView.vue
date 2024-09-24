<script setup>
  import { auth, db } from '@/firebase';
  import { signOut } from 'firebase/auth';
  import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Project from '@/components/Project.vue';

  const router = useRouter();

  let isAdmin = ref(false);
  let loaded = ref(false);
  let showProjectModal = ref(false);
  let showTasksModal = ref(false);
  let projects = ref([]);

  const projectName = ref("");
  const projectDesc = ref("");

  const taskName = ref("");
  const taskStatus = ref("");
  const userAssigned = ref("");

  // Helpers for when sign-in / out -----------------------------------------
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
    try {
      const q = query(collection(db, 'projects'));
  
      onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            if (!projects.value.find(p => p.id === change.doc.id)) {
              projects.value.push({
                id: change.doc.id,
                tasks: [],
                ...change.doc.data(),
              });
            }
          } else if (change.type === "removed") {
            projects.value = projects.value.filter(p => p.id !== change.doc.id);
          }
        });
      });
  
      projects.value.forEach((project) => {
        const taskCollection = collection(db, "projects/" + project.id + "/tasks");
        onSnapshot(taskCollection, (taskSnapshot) => {
          project.tasks = taskSnapshot.docs.map(doc => ({
             id: doc.id,
              ...doc.data()
            }));
        })
      });
    } catch(err) {
      console.error(err);
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

  // UseEffect ;) -------------------------------------------------------------
  onMounted(async () => {
    await fetchUserRole();
    await fetchProjects();
    loaded.value = true;
  })

  
  // Project handling -------------------------------------------------------------
  async function createProject() {
    try {
      showProjectModal.value = false;
      const projectCollection = collection(db, 'projects');
      await addDoc(projectCollection, {
        name: projectName.value,
        description: projectDesc.value
      })
  
      projectName.value = "";
      projectDesc.value = "";
    } catch(err) {
      console.error(err);
    }
  }

  async function deleteProject(projectIdentifier) {
    if (confirm("Are you sure you want to delete this project?") == true) {
      try {
        const projectDocument = doc(db, 'projects', projectIdentifier);
        await deleteDoc(projectDocument);
        console.log("Deleted: " + projectIdentifier);
      } catch(err) {
        console.error(err);
      }
    }
  }

  // Task handling -------------------------------------------------------------
  async function createTaskForProject(projectIdentifier) {
    const tasksCollection = collection(db, "projects/" + projectIdentifier + "/tasks");
    await addDoc(tasksCollection, {
      name: taskName,
      status: taskStatus,
      userAssigned: userAssigned
    })
  }

  async function viewTasks(projectIdentifier) {
    showTasksModal.value = true;
    console.log(projectIdentifier);
  }

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
        <div class="flex flex-col flex-grow items-center gap-3 mt-8 overflow-y-scroll">
          <!-- primary content components -->
            <Project 
              v-for="project in projects"
              :key="project.id" 
              :projectData="project" 
              :isAdmin="isAdmin" 
              @deleteProject="deleteProject"
              @viewTasks="viewTasks"
            />
        </div>
      <button v-if="isAdmin" @click="showProjectModal = true" class="bg-blue-600 hover:bg-blue-700 py-4 text-white font-semibold text-xl mt-6 rounded-3xl mb-5 w-full self-center max-w-96">+ Add new project</button>
      
      <!-- Project creation Modal -->
      <div v-if="showProjectModal == true" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
        <div class="bg-white p-5 rounded-lg shadow-lg w-full mx-3 sm:w-[500px]">
          <h3 class="font-semibold text-xl mb-5">Create Project</h3>
          <form @submit.prevent="createProject" class="flex flex-col gap-3">
            <input v-model="projectName" type="text" placeholder="Project name" required class="inputField" />
            <input v-model="projectDesc" type="text" placeholder="Description" required class="inputField" />
            <div class="flex justify-between">
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-5">Create project</button>
              <button @click="showProjectModal = false" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-5">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tasks Modal -->
      <div v-if="showTasksModal == true" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
        <div class="bg-white p-5 rounded-lg shadow-lg w-full mx-3 sm:w-[500px] flex flex-col">
          <form v-if="isAdmin" @submit.prevent="" class="flex flex-col gap-3 bg-slate-100 p-5 mb-7">
            <h3 class="font-semibold text-xl mb-5">Admin Task Management</h3>
            <input v-model="a" type="text" placeholder="Task name" required class="inputField" />
            <select v-model="b" id="users" class="inputField">
              <option value="">None</option>
              <option value="theuserid">User1</option>
              <option value="theuserid">User2</option>
            </select>
            <div class="flex justify-between">
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-5">Create task</button>
            </div>
          </form>

          <div class="max-h-96 bg-slate-100 rounded-md p-5 flex flex-col gap-4 overflow-scroll">
            <div class=" bg-slate-200 rounded-md p-5">
              <div class="flex justify-between items-center mb-5">
                <div>
                  <p class="font-bold">Look through the data</p>
                  <p class="text-red-600 font-semibold">None</p>
                </div>
                <div class="w-4 h-4 rounded-full bg-red-500"></div>
              </div>
              <div class="bg-slate-200 flex justify-between">
                <div class="flex items-center">
                  <label class="mr-2" for="assign">Assign to task</label>
                  <input type="checkbox" id="assign" @click="userAssigned = true"> 
                </div>
                <select v-if="userAssigned">
                  <option value="todo">To-do</option>
                  <option value="inprogress">In-progress</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            <div class=" bg-slate-200 rounded-md p-5">
              <div class="flex justify-between items-center mb-5">
                <div>
                  <p class="font-bold">Bug report in database</p>
                  <p class="text-green-600 font-semibold">hansen@mail.dk</p>
                </div>
                <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
              </div>
              <div class="bg-slate-200 flex justify-between">
                <div class="flex items-center">
                  
                </div>
                <select v-if="userAssigned">
                  <option value="todo">To-do</option>
                  <option value="inprogress">In-progress</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            </div>
          <button @click="showTasksModal = false" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-5">Close</button>
        </div>
      </div>

    </main>
  </div>
</template>
