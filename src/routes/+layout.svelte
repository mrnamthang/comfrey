<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Comfrey</title>
	<meta name="description" content="Guided land design tool with permaculture principles" />
</svelte:head>

{@render children()}
