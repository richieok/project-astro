<script>
    import { onMount } from "svelte";
    import { createWorld } from "$lib/three/world.js";
    import SceneOutliner from "$lib/components/SceneOutliner.svelte";

    let container;
    let world = $state(null);
    let sceneVersion = $state(0);

    let outlinerVisible = $state(true);
    let panelVisible = $state(true);

    let wireframeVisible = $state(true);
    let autoRotate = $state(false);
    let ambientLightVisible = $state(true);
    let hemisphereLightVisible = $state(false);
    let ambientIntensity = $state(1);
    let orbitRunning = $state(true);
    let orbitSpeedFactor = $state(1);
    let orbitTrailVisible = $state(true);

    onMount(() => {
        const WS_CONTROL_URL = `ws://${window.location.hostname}:8787/?role=viewer&token=devsecret`;

        const w = createWorld(container);
        const { camera, controls, pending } = w;
        console.log(camera, controls);
        connectSceneControl({ camera, controls });
        w.onOrbitStop(() => (orbitRunning = false));
        w.onSceneChange(() => sceneVersion++);

        function connectSceneControl({ camera, controls }) {
            const ws = new WebSocket(WS_CONTROL_URL);

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    switch (msg.type) {
                        case "rotate":
                            pending.rotateX += msg.dx;
                            pending.rotateY += msg.dy;
                            break;
                        case "zoom":
                            pending.zoomScale *= msg.scale;
                            break;
                    }
                } catch (err) {
                    console.error(
                        "[scene-control] failed to handle message",
                        err,
                    );
                }
            };

            ws.onclose = () => {
                // Simple reconnect; back off however you like.
                setTimeout(
                    () => connectSceneControl({ camera, controls }),
                    1000,
                );
            };

            return ws;
        }
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
    $effect(() => {
        world?.setOrbitEnabled(orbitRunning);
    });
    $effect(() => {
        world?.setOrbitSpeedFactor(orbitSpeedFactor);
    });
    $effect(() => {
        world?.setOrbitTrailVisible(orbitTrailVisible);
    });

    const viewKeys = { 1: "front", 3: "right", 7: "top" };
    function handleKeydown(event) {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        const view = viewKeys[event.key];
        if (view) world?.setView(view);
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="ui">
    <div class="viewer" bind:this={container}></div>

    <button
        class="toggle-tab outliner-tab"
        onclick={() => (outlinerVisible = !outlinerVisible)}
    >
        {outlinerVisible ? "‹" : "›"} Scene
    </button>

    {#if world && outlinerVisible}
        <div class="outliner">
            <SceneOutliner
                roots={[world.camera, world.scene]}
                refresh={sceneVersion}
            />
        </div>
    {/if}

    <button
        class="toggle-tab panel-tab"
        onclick={() => (panelVisible = !panelVisible)}
    >
        Controls {panelVisible ? "›" : "‹"}
    </button>

    {#if panelVisible}
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
                <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    bind:value={ambientIntensity}
                />
            </label>
            <div class="orbit">
                Orbit
                <label>
                    <input type="checkbox" bind:checked={orbitTrailVisible} />
                    Trail
                </label>
                <label class="slider">
                    Launch speed ×{orbitSpeedFactor.toFixed(2)}
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        bind:value={orbitSpeedFactor}
                    />
                </label>
                <div class="buttons">
                    <button
                        onclick={() => (orbitRunning = true)}
                        disabled={orbitRunning}
                    >
                        Start
                    </button>
                    <button
                        onclick={() => (orbitRunning = false)}
                        disabled={!orbitRunning}
                    >
                        Stop
                    </button>
                    <button onclick={() => world?.resetOrbit()}>Reset</button>
                </div>
            </div>
        </div>
    {/if}
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
    .toggle-tab {
        position: absolute;
        top: 1.5rem;
        z-index: 1;
        padding: 0.35rem 0.75rem;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.25rem;
        font:
            0.8125rem/1.2 system-ui,
            sans-serif;
        cursor: pointer;
        backdrop-filter: blur(4px);
    }
    .toggle-tab:hover {
        background: rgba(0, 0, 0, 0.75);
    }
    .outliner-tab {
        left: 1.5rem;
    }
    .panel-tab {
        right: 1.5rem;
    }
    .outliner {
        position: absolute;
        top: 3.25rem;
        left: 1.5rem;
        width: 16rem;
        max-height: calc(100vh - 4.75rem);
    }
    .panel {
        position: absolute;
        top: 3.25rem;
        right: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem 1.25rem;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 0.5rem;
        font:
            0.875rem/1.2 system-ui,
            sans-serif;
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
    .panel .orbit {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .panel .buttons {
        display: flex;
        gap: 0.5rem;
    }
    .panel button {
        flex: 1;
        padding: 0.25rem 0.5rem;
        background: rgba(255, 255, 255, 0.15);
        color: inherit;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.25rem;
        font: inherit;
        cursor: pointer;
    }
    .panel button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.3);
    }
    .panel button:disabled {
        opacity: 0.4;
        cursor: default;
    }
</style>
