<script>
    import { onMount } from "svelte";
    import { createWorld } from "$lib/three/world.js";

    let container;

    onMount(() => {
        const world = createWorld(container);
        return world.dispose;
    });
</script>

<div class="ui">
    <div class="viewer" bind:this={container}></div>
</div>

<style>
    .ui {
        display: grid;
        grid-template-rows: 1rem auto 2rem;
        height: 100vh;
        padding: 0 1rem 0;
    }
    .viewer {
        grid-row-start: 2;
        grid-row-end: 3;
    }
</style>
