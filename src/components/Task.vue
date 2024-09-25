<script setup>
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
    taskData: {
        type: Object,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    currentUser: {
        type: String,
        required: true
    },
    projectID: {
        type: String,
        required: true
    }
});

const emit = defineEmits(["updateTaskStatus", "assignToTask", "deleteTask"])

let selectValue = ref("");
let userMail = ref("");

async function fetchUserMail(userAssigned) {
    try {
        const userDoc = await getDoc(doc(db, "users", userAssigned));
        const userData = await userDoc.data();
        userMail.value = userData?.mail || userAssigned;
    } catch(err) {
        console.error(err);
    }
}

watch(() => props.taskData?.userAssigned,
    (userAssigned) => {
        if (userAssigned) {
            fetchUserMail(userAssigned);
            selectValue = props.taskData?.status;
        }
    },
    { immediate: true }
);

</script>

<template>
    <div v-if="taskData" class=" bg-slate-200 rounded-md p-5">
        <div class="flex justify-between items-center mb-5">
            <div>
                <p class="font-bold">{{ taskData?.name }}</p>
                <p class="font-semibold text-gray-500">Assigned: <span :class="taskData?.userAssigned == 'None' ? 'text-red-600' : 'text-green-600'">{{ taskData?.userAssigned == currentUser ? "(You)" : userMail }}</span></p>
            </div>
            <div class="w-4 h-4 rounded-full"
                :class="
                taskData?.status == 'todo' ? 'bg-red-500' :
                taskData?.status == 'inprogress' ? 'bg-yellow-500':
                taskData?.status == 'finished' ? 'bg-green-500' 
                : 'bg-red-500'"></div>
        </div>
        <div class="bg-slate-200">
            <div class="flex justify-start">
                <div v-if="taskData?.userAssigned == 'None'" class="flex items-center">
                    <label class="mr-2" for="assign">Assign yourself to task</label>
                    <input type="checkbox" id="assign" @click="$emit('assignToTask', projectID, taskData?.id, currentUser)"> 
                </div>
                <select v-model="selectValue" v-if="taskData?.userAssigned == currentUser">
                    <option value="todo">To-do</option>
                    <option value="inprogress">In-progress</option>
                    <option value="finished">Finished</option> 
                </select>
                <button v-if="taskData?.userAssigned == currentUser" @click="$emit('updateTaskStatus', projectID, taskData?.id, selectValue)" class="bg-blue-500 text-white px-3 py-1 rounded-sm">Update</button>
                <button v-if="isAdmin" @click="$emit('deleteTask', projectID, taskData?.id)" class="bg-red-500 text-white px-3 py-1.5 rounded-md ml-auto">Delete</button>
            </div>
        </div>
    </div>
</template>

