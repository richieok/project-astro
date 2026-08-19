<script>
	import SceneTreeNode from './SceneTreeNode.svelte';
	import { nodeColor } from '$lib/three/utils/nodeColor.js';

	let { object, depth = 0 } = $props();

	let expanded = $state(true);

	const children = $derived(object.children ?? []);
	const hasChildren = $derived(children.length > 0);
	const label = $derived(object.name || object.type);
	const color = $derived(nodeColor(object));
</script>

<div class="row" style="padding-left: {depth * 1.1}rem">
	<button
		class="toggle"
		class:hidden={!hasChildren}
		onclick={() => (expanded = !expanded)}
		aria-label={expanded ? 'Collapse' : 'Expand'}
	>
		{expanded ? '−' : '+'}
	</button>
	<span class="dot" style="background: {color}"></span>
	<span class="label">{label}</span>
</div>

{#if hasChildren && expanded}
	{#each children as child (child.uuid)}
		<SceneTreeNode object={child} depth={depth + 1} />
	{/each}
{/if}

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.5rem;
		font: 0.875rem/1.2 system-ui, sans-serif;
		color: #4b5563;
		white-space: nowrap;
	}
	.row:hover {
		background: #f7f6f6;
	}
	.toggle {
		width: 1rem;
		flex: none;
		border: none;
		background: none;
		padding: 0;
		font: inherit;
		color: #9ca3af;
		cursor: pointer;
	}
	.toggle.hidden {
		visibility: hidden;
	}
	.dot {
		width: 0.5rem;
		height: 0.5rem;
		flex: none;
		border-radius: 50%;
	}
	.label {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
