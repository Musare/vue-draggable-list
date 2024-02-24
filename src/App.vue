<script lang="ts" setup>
import { reactive } from "vue";
import DraggableList from "./components/DraggableList.vue";

const testArray1 = reactive([
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

const testArray2 = reactive([
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
    <h1>Examples</h1>
    <h2>Example 1</h2>
    <DraggableList
        item-key="id"
        v-model:list="testArray1"
        @start="onStart"
        @end="onEnd"
        @update="onUpdate"
    >
        <template #item="{ element }">
            <h3>{{ element.id }} - {{ element.name }}</h3>
        </template>
    </DraggableList>

    <hr />

    <h2>Example 2</h2>
    <DraggableList
        item-key="id"
        v-model:list="testArray2"
        @start="onStart"
        @end="onEnd"
        @update="onUpdate"
        handle-class="handle"
    >
        <template #item="{ element }">
            <div class="card">
                <div class="handle">
                    <span>Handle</span>
                </div>
                <p>{{ element.id }} - {{ element.name }}</p>
            </div>
        </template>
    </DraggableList>
</template>

<style scoped></style>
