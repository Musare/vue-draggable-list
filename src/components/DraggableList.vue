<script setup lang="ts">
import { PropType, Slot as SlotType, watch, onMounted, ref } from "vue";

const props = defineProps({
    itemKey: { type: String, default: "" },
    list: { type: Array as PropType<any[]>, default: () => [] },
    attributes: { type: Object, default: () => ({}) },
    tag: { type: String, default: "div" },
    group: { type: String, default: "" },
    disabled: { type: [Boolean, Function], default: false },
    touchTimeout: { type: Number, default: 250 },
    handleClass: { type: String, required: false, default: null }
});

const listUuid = ref(
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, symbol => {
        let array;

        if (symbol === "y") {
            array = ["8", "9", "a", "b"];
            return array[Math.floor(Math.random() * array.length)];
        }

        array = new Uint8Array(1);
        window.crypto.getRandomValues(array);
        return (array[0] % 16).toString(16);
    })
);
const mounted = ref(false);
const data = ref([] as any[]);
const isDraggable = ref(props.handleClass ? false : true);

const touching = ref(false);
const touchDragging = ref(false);
const touchingTimeout = ref<null | number>(null);

watch(
    () => props.list,
    list => {
        data.value = list;
    }
);

onMounted(() => {
    data.value = props.list;
    mounted.value = true;
});

const emit = defineEmits(["update:list", "start", "end", "update"]);

const hasHandleAtPosition = (event: MouseEvent | DragEvent) => {
    const { clientX: x, clientY: y } = event;
    const elementsAtPosition = document.elementsFromPoint(x, y);
    return elementsAtPosition.reduce<boolean | null>(
        (clickedHandle, elementAtPosition) => {
            // If we already have a boolean result, return that
            if (typeof clickedHandle === "boolean") return clickedHandle;
            // If the clicked element (or one of its parents) has the handle class, we clicked the handle
            if (elementAtPosition.classList.contains(props.handleClass!))
                return true;
            // If we've reached the draggable element itself, we found no handle, so return false to avoid
            // accidentally using handles with the same class outside the draggable element
            if (elementAtPosition.classList.contains("draggable-item"))
                return false;
            return null;
        },
        null
    );
};

const onMouseDown = (itemIndex: number, event: MouseEvent) => {
    if (!props.handleClass) return;

    isDraggable.value = !!hasHandleAtPosition(event);
};

const onMouseUp = (itemIndex: number, event: MouseEvent) => {
    if (props.handleClass) isDraggable.value = false;
};

const itemOnMove = (index: number) => {
    // Deletes the remove function for the dragging element
    if (window.draggingItem && window.draggingItem.itemOnMove)
        delete window.draggingItem.itemOnMove;
    // Remove the item from the current list and return it
    const listItem = data.value.splice(index, 1)[0];
    emit("update:list", data.value);
    return listItem;
};

// When an element starts being dragged
const onDragStart = (itemIndex: number, event: DragEvent) => {
    const { draggable } = event.target as HTMLElement;

    if (
        props.disabled === true ||
        (typeof props.disabled === "function" &&
            props.disabled(data.value[itemIndex])) ||
        !draggable ||
        !event.dataTransfer ||
        (touching.value && !touchDragging.value)
    ) {
        event.preventDefault();
        return;
    }

    // If we only want to start dragging if the user clicked on a handle element
    if (props.handleClass) {
        // If no handle was clicked, we don't want to start dragging the element
        if (!hasHandleAtPosition(event)) return;
    }

    // Set the effect of moving an element, which by default is clone. Not being used right now
    event.dataTransfer.dropEffect = "move";

    // Sets the dragging element index, list uuid and adds a remove function for when this item is moved to a different list
    window.draggingItem = {
        itemIndex,
        itemListUuid: listUuid.value,
        itemGroup: props.group,
        itemOnMove,
        initialItemIndex: itemIndex,
        initialItemListUuid: listUuid.value
    };

    // Emits the start event to the parent component, indicating that dragging has started
    emit("start");
};

// When a dragging element hovers over another draggable element, this gets triggered, usually many times in a second
const onDragOver = (itemIndex: number, event: DragEvent, push = false) => {
    const getDraggableElement = (
        element: HTMLElement
    ): HTMLElement | undefined => {
        if (
            element.classList.contains("draggable-item") ||
            element.classList.contains("empty-list-placeholder")
        )
            return element;
        if (element.parentElement)
            return getDraggableElement(element.parentElement);
        return undefined;
    };
    const draggableElement = getDraggableElement(event.target as HTMLElement);

    if (
        props.disabled === true ||
        !draggableElement ||
        (!draggableElement.draggable && !push) ||
        !window.draggingItem
    )
        return;

    // The index and list uuid of the item that is being dragged, stored in window since it can come from another list as well
    const fromIndex = window.draggingItem.itemIndex;
    const fromList = window.draggingItem.itemListUuid;
    // The new index and list uuid of the item that is being dragged
    const toIndex = itemIndex;
    const toList = listUuid.value;

    // If the item hasn't changed position in the same list, don't continue
    if (fromIndex === toIndex && fromList === toList) return;

    // If the dragging item isn't from the same group, don't continue
    if (
        fromList !== toList &&
        (props.group === "" || window.draggingItem.itemGroup !== props.group)
    )
        return;

    // Update the index and list uuid of the dragged item
    window.draggingItem.itemIndex = toIndex;
    window.draggingItem.itemListUuid = listUuid.value;

    // If the item comes from another list
    if (toList !== fromList && window.draggingItem.itemOnMove) {
        // Call the remove function from the dragging element, which removes the item from the previous list and returns it
        const item = window.draggingItem.itemOnMove(fromIndex);
        // Define a new remove function for the dragging element
        window.draggingItem.itemOnMove = itemOnMove;
        window.draggingItem.itemGroup = props.group;
        // Add the item to the list at the new index
        if (push) data.value.push(item);
        else data.value.splice(toIndex, 0, item);
        emit("update:list", data.value);
    }
    // If the item is being reordered in the same list
    else {
        // Remove the item from the old position, and add the item to the new position
        data.value.splice(toIndex, 0, data.value.splice(fromIndex, 1)[0]);
        emit("update:list", data.value);
    }
};
// Gets called when the element that is being dragged is released
const onDragEnd = () => {
    // Emits the end event to parent component, indicating that dragging has ended
    emit("end");

    if (props.handleClass) isDraggable.value = false;

    // Emits the update event to parent component, indicating that the order is now done and ordering/moving is done
    if (!window.draggingItem) return;
    const { itemIndex, itemListUuid, initialItemIndex, initialItemListUuid } =
        window.draggingItem;
    if (itemListUuid === initialItemListUuid) {
        if (initialItemIndex === itemIndex) return;

        emit("update", {
            moved: {
                oldIndex: initialItemIndex,
                newIndex: itemIndex,
                updatedList: data.value
            }
        });
    } else emit("update", {});
    delete window.draggingItem;
};

// Gets called when an element is dropped on another element, currently not used
const onDrop = () => {};

// Function that gets called for each item and returns attributes
const convertAttributes = (item: any) =>
    Object.fromEntries(
        Object.entries(props.attributes).map(([key, value]) => [
            key,
            typeof value === "function" ? value(item) : value
        ])
    );

const hasSlotContent = (slot: SlotType | undefined, slotProps = {}) => {
    if (!slot) return false;

    return slot(slotProps).some(vnode => {
        if (
            vnode.type === Comment ||
            vnode.type.toString() === "Symbol(Comment)"
        )
            return false;

        if (Array.isArray(vnode.children) && !vnode.children.length)
            return false;

        if (vnode.children === "") return false;

        return (
            vnode.type !== Text ||
            vnode.type.toString() !== "Symbol(Text)" ||
            (typeof vnode.children === "string" && vnode.children.trim() !== "")
        );
    });
};

const onTouchStart = (event: TouchEvent) => {
    touching.value = true;
    touchDragging.value = false;

    // When we use handles, we need to find the element that is the handle, up until the draggable-item element itself
    if (props.handleClass) {
        let handleElement = event.target as HTMLElement | null;
        while (
            handleElement &&
            !handleElement.classList.contains(props.handleClass)
        ) {
            if (handleElement.classList.contains("draggable-item")) {
                handleElement = null;
                break;
            }
            handleElement = handleElement.parentElement;
        }
        // If the user is touching the handle, set isDraggable to true so dragging is allowed to start in onDragStart
        if (handleElement) isDraggable.value = true;
    }

    if (touchingTimeout.value) clearTimeout(touchingTimeout.value);

    touchingTimeout.value = setTimeout(() => {
        touchDragging.value = true;
    }, props.touchTimeout);
};

const onTouchEnd = () => {
    touching.value = false;
    touchDragging.value = false;
    // When we use handles, isDragging should default to false, so the user has to start dragging the handle for isDragging to be changed to true
    if (props.handleClass) isDraggable.value = false;

    if (touchingTimeout.value) clearTimeout(touchingTimeout.value);
    touchingTimeout.value = null;
};
</script>

<script lang="ts">
import { polyfill as mobileDragDropPolyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride as mobileDragDropScrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

mobileDragDropPolyfill({
    dragImageTranslateOverride:
        mobileDragDropScrollBehaviourDragImageTranslateOverride,
    tryFindDraggableTarget: event => {
        const getDraggableElement = (
            element: HTMLElement
        ): HTMLElement | undefined => {
            if (element.classList.contains("draggable-item")) return element;
            if (element.parentElement)
                return getDraggableElement(element.parentElement);
            return undefined;
        };

        return getDraggableElement(event.target as HTMLElement);
    }
});

window.addEventListener("touchmove", () => {});
</script>

<template>
    <template v-for="(item, itemIndex) in data" :key="item[itemKey]">
        <component
            v-if="hasSlotContent($slots.item, { element: item })"
            :is="tag"
            :draggable="
                (typeof disabled === 'function'
                    ? !disabled(item)
                    : !disabled) && isDraggable
            "
            @mousedown="onMouseDown(itemIndex, $event)"
            @mouseup="onMouseUp(itemIndex, $event)"
            @touchstart.passive="onTouchStart($event)"
            @touchend="onTouchEnd()"
            @dragstart="onDragStart(itemIndex, $event)"
            @dragenter.prevent
            @dragover.prevent="onDragOver(itemIndex, $event)"
            @dragend="onDragEnd()"
            @drop="onDrop()"
            :data-index="itemIndex"
            :data-list="listUuid"
            class="draggable-item"
            v-bind="convertAttributes(item)"
        >
            <slot name="item" :element="item" :index="itemIndex"></slot>
        </component>
    </template>
    <div
        v-if="data.length === 0"
        class="empty-list-placeholder"
        @dragover.prevent="onDragOver(0, $event, true)"
        @drop.prevent
    ></div>
</template>

<style lang="css">
@import "mobile-drag-drop/default.css";

.draggable-item[draggable="true"] {
    cursor: move;
}
.draggable-item:not(:last-of-type) {
    margin-bottom: 10px;
}
.draggable-item .draggable-handle {
    cursor: move;
    user-select: none;
}
.empty-list-placeholder {
    flex: 1;
}
</style>
