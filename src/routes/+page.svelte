<script lang="ts">
	import { generate } from "$lib/noise/index";
	import { onMount } from "svelte";

	onMount(() => {
		generate("canvas");
	});
</script>

<main>
	<div class="controls">Panel</div>
	<div class="pane">
		<canvas id="canvas"></canvas>
	</div>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html, body) {
		padding: 0;
		margin: 0;
	}

	main {
		display: flex;
		flex-direction: row;
		height: 100vh;
		width: 100vw;
		background-color: rgba(20, 20, 20, 1);
	}

	.controls {
		width: 500px;
	}

	.pane {
		flex: 1;
		padding: 32px;
		align-items: center;
		justify-content: center;
		justify-items: center;
	}

	canvas {
		background-color: white;
		width: 200px;
		height: 200px;
	}
</style>
