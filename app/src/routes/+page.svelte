<script>
    import { onMount } from "svelte";
    import { createWorld } from "$lib/three/world.js";
    import SceneOutliner from "$lib/components/SceneOutliner.svelte";
    import QrCode from "$lib/components/QrCode.svelte";

    let container;
    let world = $state(null);
    let sceneVersion = $state(0);

    let outlinerVisible = $state(true);
    let panelVisible = $state(true);

    // Shared with ws-control via CONTROL_TOKEN in compose.yml.
    const CONTROL_TOKEN = "devsecret";
    const CONTROL_PORT = 8787;

    // The machine's LAN address, resolved at config time by vite.config.js — the
    // browser itself can only ever report the hostname that was typed into the
    // address bar, which is "localhost" often enough to be useless to a phone.
    const LAN_HOST = import.meta.env.VITE_CONTROL_HOST ?? "";

    const isLoopback = (host) => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host);

    // Host the phone should dial to reach ws-control. Editable, because neither
    // source is right on every machine — a VPN or a second NIC can win the
    // interface list, and the prod compose file doesn't set CONTROL_HOST at all.
    let controlHost = $state("");
    let qrVisible = $state(false);
    let qrWrapper = $state(null);

    const controlUrl = $derived(
        `http://${controlHost}:${CONTROL_PORT}/control?token=${CONTROL_TOKEN}`,
    );
    const hostIsLoopback = $derived(isLoopback(controlHost));

    let wireframeVisible = $state(true);
    let autoRotate = $state(false);
    let ambientLightVisible = $state(true);
    let hemisphereLightVisible = $state(false);
    let ambientIntensity = $state(1);
    let orbitRunning = $state(true);
    let orbitSpeedFactor = $state(1);
    let orbitTrailVisible = $state(true);

    onMount(() => {
        // Browsing at a real address already means it's reachable, so only fall
        // back to the injected LAN address when this page is on loopback.
        const { hostname } = window.location;
        controlHost = isLoopback(hostname) ? LAN_HOST || hostname : hostname;

        const WS_CONTROL_URL = `ws://${window.location.hostname}:${CONTROL_PORT}/?role=viewer&token=${CONTROL_TOKEN}`;

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
        if (event.key === "Escape") {
            qrVisible = false;
            return;
        }
        // The view shortcuts are bare digits, so stay out of the way while
        // someone is typing a host into the QR popover.
        if (event.target instanceof HTMLInputElement && event.target.type === "text")
            return;
        const view = viewKeys[event.key];
        if (view) world?.setView(view);
    }

    // Light dismiss, the way a popover is expected to behave.
    function handlePointerDown(event) {
        if (qrVisible && !qrWrapper?.contains(event.target)) qrVisible = false;
    }
</script>

<svelte:window onkeydown={handleKeydown} onpointerdown={handlePointerDown} />

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

            <div class="phone" bind:this={qrWrapper}>
                <button
                    class="phone-toggle"
                    aria-expanded={qrVisible}
                    onclick={() => (qrVisible = !qrVisible)}
                >
                    Phone control
                </button>

                {#if qrVisible}
                    <div class="qr-popover">
                        <QrCode text={controlUrl} />
                        <label class="host">
                            Host
                            <input
                                type="text"
                                bind:value={controlHost}
                                spellcheck="false"
                                autocapitalize="off"
                                autocorrect="off"
                            />
                        </label>
                        <p class="url">{controlUrl}</p>
                        {#if hostIsLoopback}
                            <p class="hint">
                                Your phone can't reach {controlHost} — put this
                                machine's LAN address here instead.
                            </p>
                        {/if}
                    </div>
                {/if}
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
    .phone {
        position: relative;
    }
    .phone-toggle {
        width: 100%;
    }
    /* The panel is pinned to the right edge, so the popover opens inward. */
    .qr-popover {
        position: absolute;
        top: 0;
        right: calc(100% + 0.75rem);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 13rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 0.5rem;
        backdrop-filter: blur(4px);
    }
    .qr-popover .host {
        flex-direction: column;
        align-items: stretch;
        gap: 0.25rem;
    }
    .qr-popover input {
        padding: 0.25rem 0.4rem;
        background: rgba(255, 255, 255, 0.1);
        color: inherit;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.25rem;
        font: inherit;
    }
    .qr-popover .url,
    .qr-popover .hint {
        font-size: 0.6875rem;
        line-height: 1.35;
        overflow-wrap: anywhere;
    }
    .qr-popover .url {
        opacity: 0.6;
        font-family: ui-monospace, monospace;
    }
    .qr-popover .hint {
        color: #ffd08a;
    }
</style>
