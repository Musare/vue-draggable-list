<script lang="ts" setup>
import { reactive } from "vue";
import DraggableList from "./components/DraggableList.vue";

const testArray = reactive([
    {
        id: 1,
        name: "Bob"
    },
    {
        id: 2,
        name: "Alice"
    },
    {
        id: 3,
        name: "Lisa"
    }
]);

const onStart = (...args) => {
    console.log("On start", args);
};

const onEnd = (...args) => {
    console.log("On end", args);
};

const onUpdate = (...args) => {
    console.log("On update", args);
};
</script>

<template>
    <h1>Example</h1>
    <DraggableList
        item-key="id"
        v-model:list="testArray"
        @start="onStart"
        @end="onEnd"
        @update="onUpdate"
    >
        <template #item="{ element }">
            <h2>{{ element.id }} - {{ element.name }}</h2>
        </template>
    </DraggableList>
</template>

<style scoped></style>
