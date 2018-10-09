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

<style scoped>
    .find-helper {
        left: 20%;
        top: calc(50% - 32px);
		position: absolute;
        background: transparent;
        line-height: 64px;
		font-size: 84px;
		font-family: Roboto;
		padding: 0 8px 0 8px;
        transition: all ease-in-out;
	}
</style>