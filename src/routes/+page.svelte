<script>
    import { onMount } from "svelte";
    import { createWorld } from "$lib/three/world.js";

    let container;
    let world = $state(null);

    let wireframeVisible = $state(true);
    let autoRotate = $state(false);
    let ambientLightVisible = $state(true);
    let hemisphereLightVisible = $state(false);
    let ambientIntensity = $state(1);

    onMount(() => {
        const w = createWorld(container);
        world = w;
        return w.dispose;
    });

    $effect(() => {
        world?.setWireframeVisible(wireframeVisible);
    });
    $effect(() => {
        world?.setAutoRotate(autoRotate);
    });
    $effect(() => {
        world?.setAmbientLightVisible(ambientLightVisible);
    });
    $effect(() => {
        world?.setHemisphereLightVisible(hemisphereLightVisible);
    });
    $effect(() => {
        world?.setAmbientIntensity(ambientIntensity);
    });
</script>

<div class="ui">
    <div class="viewer" bind:this={container}></div>

    <div class="panel">
        <label>
            <input type="checkbox" bind:checked={wireframeVisible} />
            Wireframe
        </label>
        <label>
            <input type="checkbox" bind:checked={autoRotate} />
            Auto-rotate
        </label>
        <label>
            <input type="checkbox" bind:checked={ambientLightVisible} />
            Ambient light
        </label>
        <label>
            <input type="checkbox" bind:checked={hemisphereLightVisible} />
            Hemisphere light
        </label>
        <label class="slider">
            Intensity
            <input type="range" min="0" max="3" step="0.1" bind:value={ambientIntensity} />
        </label>
    </div>
</div>

<style>
    .ui {
        position: relative;
        display: grid;
        grid-template-rows: 1rem auto 1rem;
        height: 100vh;
        padding: 0 1rem 0;
    }
    .viewer {
        grid-row-start: 2;
        grid-row-end: 3;
    }
    .panel {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem 1.25rem;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 0.5rem;
        font: 0.875rem/1.2 system-ui, sans-serif;
        backdrop-filter: blur(4px);
    }
    .panel label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }
    .panel .slider {
        flex-direction: column;
        align-items: stretch;
        gap: 0.25rem;
    }
</style>
