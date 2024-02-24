# vue-draggable-list

[npm](https://www.npmjs.com/package/vue-draggable-list)

vue-draggable-list is a vue drag and drop component utilising [mobile-drag-drop](https://github.com/timruffles/mobile-drag-drop).

Originally created for [Musare](https://github.com/Musare/Musare).

## Dependencies

- Vue 3
- NodeJS v16+

## Installation

1. Install the package

    ```bash
    npm install vue-draggable-list
    ```

2. Import styling in to your package globally

    ```javascript
    @import "vue-draggable-list/dist/style.css";
    ```

3. Import component

    ```javascript
    import { DraggableList } from "vue-draggable-list";
    ```

4. Use the component

    ```javascript
    <draggable-list
        item-key="_id"
        v-model:list="myList"
        :attributes="{
            class: element => ({
                'left': element.left
            }),
            title: 'Title'
        }"
        tag="div"
        group="myGroup"
        :disabled="isListDisabled()"
        :touch-timeout="250"
        @start="drag = true"
        @end="drag = false"
        @update="updateList"
    >
        <template #item="{ element, index }">
            <my-element :data="element" :index="index" />
        </template>
    </draggable-list>
    ```

### Props

| Name | Type | Default | Optional | Description |
| --- | --- | --- | --- | --- |
| itemKey | String | | No | Name of the property that is unique in each list item. |
| list | Array | | No | List of items, if defined as a v-model any updates will be applied to provided list. |
| attributes | Object | | Yes | Object of functions or attributes of any type that will be called or applied to each item and added as an attribute. |
| tag | String | `div` | Yes | Name of the HTML element of each item. |
| group | String | | Yes | Name of the group, so you can move items between different lists in the same group. Leaving it empty will disable moving between lists. |
| disabled | Boolean or Function | `false` | Yes | Used to disable dragging inside a list in general, or with a function you can prevent specific items from being dragged. |
| touchTimeout | Number | 250 | Yes | Time in milliseconds that a user is required to hold list item before dragging is started. |
| handleClass | String | N/A | Yes | Class of handle elements. For example: "handle". If specified, only elements with this class can be used to start dragging. |

### Emits

| Name | Data | Description |
| --- | --- | --- |
| start | | Emitted when dragging starts. |
| end | | Emitted when dragging stops. |
| update | `{ moved: { oldIndex: Number, newIndex: Number, updatedList: Array }` | Emitted when an element is dropped in the same list, which returns the old and new index and the new list of items. |
