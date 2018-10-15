<template>
    <div class="sidebar">
        <div
            v-for="(item, index) in items"
            class="sidebar-item"
            @click="setActiveItem(index)"
            :class="{active: index===active}"
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

<style scoped>
    .sidebar {
        width: 10%;
        background: #E0E0E0;
        border-right: 1px solid #202124;
    }
    .sidebar-item {
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        font-family: Roboto;
        text-align: center;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.7);
        position: relative;
    }
    .sidebar-item.active:after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 1px;
        width: 100%;
        height: 2px;
        background: #607D8B;
    }
    .sidebar-item.active:before {
        content: "";
        position: absolute;
        left: 6px;
        top: 10px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        background: #607D8B;
    }
</style>