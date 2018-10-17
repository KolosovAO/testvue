<template>
    <div class="error">{{message}}</div>
</template>

<script>
    export default {
        name: 'ErrorMessage',
        props: {
            message: String
        }
    }
</script>

<style scoped>
    .error {
        position: fixed;
        top: 0;
        right: 0;
        width: 200px;
        height: 80px;
        background: rgba(255, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Roboto;
        font-size: 20px;
        color: #FFF;
	}
</style>