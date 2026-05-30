<script>
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from "svelte";

	import { getSession } from "$lib/detection/yolo"

	let { children } = $props();

	export const ssr = false;
	export const prerender = true;

	onMount(() => getSession()) // warm-up silencieux
	
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
