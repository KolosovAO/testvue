<template>
    <div v-if="!hide" class="find-helper">{{filter}}</div>
</template>

<script>
export default {
    name: 'Finder',
    data() {
        return {
            hide: false,
            timeout: null
        }
    },
    props: {
        filter: String
    },
    watch: {
        filter() {
            this.hide = false;
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.hide = true;
            }, 3000);
        }
    }
}
</script>