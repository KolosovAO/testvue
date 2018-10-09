<template>
	<div id="app">
		<div class="app-header">
    		<img class="logo" src="./assets/bear.jpg">
			<div class="header-text">MEDVEBOT</div>
		</div>
		<dota></dota>
	</div>
</template>

<script>
import Dota from './components/Dota'

export default {
	name: 'App',
	components: {
		dota: Dota
	}
}
</script>

<style>
	html, body {
		padding: 0;
		margin: 0;
	}
	.app-header {
		display: flex;
		height: 60px;
		line-height: 60px;
		width: 100%;
		background: #202124;	
	}
	.logo {
		height: 60px;
		width: 90px;
	}
	.header-text {
		text-align: center;
		font-family: Roboto;
		color: #FFF;
		font-size: 40px;
	}
	#app {
		height: 100vh;
	}
</style>
