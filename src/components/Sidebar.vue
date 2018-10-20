<template>
    <div class="sidebar">
        <div
            v-for="(item, index) in items"
            class="sidebar-item"
            @click="setActiveItem(index)"
            :class="{active: index===active}"
            :key="index"
        >
            {{item}}
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Sidebar',
        data() {
            return {
                items: [
                    "Pick helper",
                    "Player info"
                ]
            }
        },
        props: {
            active: Number
        },
        methods: {
            setActiveItem(index) {
                this.$root.$emit("updateAcitveItem", index);
            }
        }
    }
</script>