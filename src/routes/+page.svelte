<script lang="ts">
	import { onMount } from "svelte";
	import ConfigProperty from "../components/ConfigProperty.svelte";
	import { generate } from "$lib/noise/noise";

	let anchors = $state(0);
	let spread = $state(0);
	let brightness = $state(0);
	let smoothing = $state(0);

	onMount(() => {
		const savedConf = window.localStorage.getItem("noiseconfig");

		if (!savedConf) {
			return;
		}

		let parsedConf = JSON.parse(savedConf);

		anchors = parsedConf.anchors ?? 0;
		spread = parsedConf.spread ?? 0;
		brightness = parsedConf.brightness ?? 0;
		smoothing = parsedConf.smoothing ?? 0;
	});

	function regenerate() {
		let conf = {
			anchors,
			spread,
			brightness,
			smoothing,
		};
		// save config
		localStorage.setItem("noiseconfig", JSON.stringify(conf));

		generate("canvas", conf);
	}
</script>

<main>
	<div class="controls">
		<h1>Noise generator</h1>
		<h2>
			This is very slow. Please check the readme file before
			tweaking values, or your browser will need a nappy
			change.
		</h2>

		<ConfigProperty label="Anchors" bind:value={anchors} />
		<ConfigProperty label="Spread" bind:value={spread} />
		<ConfigProperty label="Brightness" bind:value={brightness} />
		<ConfigProperty label="Smoothing" bind:value={smoothing} />

		<button onclick={regenerate}>Generate</button>
	</div>
	<div class="pane">
		<canvas id="canvas"></canvas>
	</div>
</main>

<style>
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
		width: 300px;
		background-color: rgba(10, 10, 10, 1);
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
	}

	.pane {
		flex: 1;
		padding: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	canvas {
		background-color: white;
		width: 500px;
		height: 500px;
	}

	h1,
	h2 {
		color: rgb(210, 210, 210);
		margin: 0 0 12px 0;
		padding: 0;
		font-weight: normal;
		font-size: 24px;
	}

	h2 {
		font-size: 12px;
		background-color: rgba(255, 255, 0, 0.2);
		padding: 12px;
	}

	button {
		padding: 12px;
		margin-top: 12px;
		background-color: rgba(0, 100, 200, 0.4);
		color: white;
		outline: rgba(0, 25, 50, 1);
		border: none;
	}

	button:hover {
		cursor: pointer;
	}

	button:active {
		background-color: rgba(0, 120, 240, 0.4);
	}
</style>
