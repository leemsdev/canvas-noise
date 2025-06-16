<script lang="ts">
	let { label, value = $bindable(0) } = $props();
</script>

<label>
	<span>{label}</span>
	<input type="number" bind:value />
</label>

<style>
	label {
		display: flex;
		color: rgb(200, 200, 200);
		gap: 8px;
		align-items: center;
		justify-content: space-between;
	}

	label > span {
		flex: 1;
	}

	input {
		background-color: rgb(50, 50, 50);
		padding: 4px 12px;
		border-radius: 15px;
		outline: none;
		border: none;
		color: rgb(200, 200, 200);
		width: 100px;
		appearance: textfield;
	}
</style>
