<script>
	import SceneTreeNode from './SceneTreeNode.svelte';

	// `refresh` should be bumped by the caller whenever objects are added to/removed
	// from the tree after the initial render (e.g. an async model load), since
	// Three.js object graphs aren't reactive on their own.
	let { roots, refresh = 0 } = $props();
</script>

<div class="scene-outliner">
	{#key refresh}
		{#each roots as root (root.uuid)}
			<SceneTreeNode object={root} depth={0} />
		{/each}
	{/key}
</div>

<style>
	.scene-outliner {
		overflow-y: auto;
		background: #fff;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
</style>
