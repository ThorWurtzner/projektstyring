<script setup>
  import { auth, db } from '@/firebase';
  import { signOut } from 'firebase/auth';
  import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc } from 'firebase/firestore';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Project from '@/components/Project.vue';
  import Task from '@/components/Task.vue';

  const router = useRouter();

  let isAdmin = ref(false);
  let loaded = ref(false);
  let tasksLoaded = ref(false);
  let showProjectModal = ref(false);
  let showTasksModal = ref(false);
  let projects = ref([]);
  let tasks = ref([]);
  let users = ref([]);
  let currentProjectID = ref("");
  let currentProjectName = ref("");

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

      loaded.value = true;

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
  async function viewTasks(projectIdentifier, projectName) {
    tasksLoaded.value = false;
    showTasksModal.value = true;
    currentProjectID = projectIdentifier;
    userAssigned.value = "None";
    tasks.value = [];
    taskName.value = "";
    currentProjectName.value = projectName;
    
    try {
      // Get users for admin panel
      if (isAdmin) {
        const userCollection = collection(db, "users");
        const userSnapshot = await getDocs(userCollection);
        users.value = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }
    
      // Get actual tasks
      const tasksCollection = collection(db, "projects/" + projectIdentifier + "/tasks");
      onSnapshot(tasksCollection, (tasksSnapshot) => {
        tasks.value = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          projectIdentifier: projectIdentifier,
          ...doc.data()
        }))
        
        tasksLoaded.value = true;
      })
    } catch(err) {
      console.error(err);
    }
    
  }

  async function createTaskForProject() {
    try {
      const tasksCollection = collection(db, "projects/" + currentProjectID + "/tasks");
      await addDoc(tasksCollection, {
        name: taskName.value,
        status: "todo",
        userAssigned: userAssigned.value
      })

      taskName = "";
      taskStatus = "None";
    } catch(err) { 
      console.error(err);
    }
  }

  async function updateTaskStatus(projectID, taskID, value) {
    try {
      const taskDoc = doc(db, "projects", projectID, "tasks", taskID);
      await updateDoc(taskDoc, {
        status: value
      })
    } catch(err) {
      console.error(err);
    }
  }

  async function assignToTask(projectID, taskID, currentUser) {
    
    try {
      const taskDoc = doc(db, "projects", projectID, "tasks", taskID);
      await updateDoc(taskDoc, {
        userAssigned: currentUser
      })
    } catch(err) {
      console.error(err);
    }
  }

  async function deleteTask(projectID, taskID) {
    if (confirm("Are you sure you want to delete this task?") == true) {
      try {
        const taskDocument = doc(db, 'projects', projectID, 'tasks', taskID);
        await deleteDoc(taskDocument);
        console.log("Deleted: " + taskID);
      } catch(err) {
        console.error(err);
      }
    }
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
          <h1 class="text-3xl font-semibold w-full text-center border-b-4 border-blue-50 rounded-3xl pb-5 mb-3 md:w-96">Projects</h1>
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
        <div v-if="!tasksLoaded" class="flex justify-center items-center h-screen">
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid border-opacity-50"></div>
        </div>
        <div v-else class="bg-white p-5 rounded-lg shadow-lg w-full mx-3 sm:w-[500px] flex flex-col">
          <h3 class="font-semibold text-xl mb-5 text-gray-400">'{{ currentProjectName }}'</h3>
          <form v-if="isAdmin" @submit.prevent="createTaskForProject" class="flex flex-col gap-3 bg-slate-100 p-5 mb-7">
            <h3 class="font-semibold text-xl mb-5">Admin Task Management</h3>
            <input v-model="taskName" type="text" placeholder="Task name" required class="inputField" />
            <select v-model="userAssigned" id="users" class="inputField">
              <option value="None">None</option>
              <option :class="auth.currentUser.uid == user.id ? 'text-orange-700' : 'initial'"
                v-for="user in users"
                :key="user.id"
                :value="user.id">
                {{ auth.currentUser.uid == user.id ? `${user.mail} (Yourself)` : user.mail }}
              </option>
            </select>

            <div class="flex justify-between">
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-5">Create task</button>
            </div>
          </form>

            <div class="max-h-96 min-h-40 bg-slate-100 rounded-md p-5 flex flex-col gap-4 overflow-scroll">

              <Task v-if="tasks" v-for="task in tasks"
                :key="task.id"
                :taskData="task"
                :isAdmin="isAdmin"
                :currentUser="auth.currentUser.uid"
                :projectID="currentProjectID"
                @assignToTask="assignToTask"
                @updateTaskStatus="updateTaskStatus"
                @deleteTask="deleteTask"
              />

            </div>
          <button @click="showTasksModal = false" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-5">Close</button>
        </div>
      </div>

    </main>
  </div>
</template>
