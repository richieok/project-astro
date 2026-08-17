<script>
    import { onMount } from "svelte";
    let { children } = $props();
    let view;
    let menuArray = $state([]);
    let currentTab = 0;

    function menuClick(evt) {
        let tabNum = evt.target.dataset?.tabNum;
        if (tabNum) {
            currentTab = +tabNum;
            console.log(+tabNum);
            switchTab(currentTab);
        }
    }

    function init() {
        let localMenu = [];
        console.log(view);
        for (let i = 0; i < view.children.length; i++) {
            localMenu = [...localMenu, view.children[i].dataset.contentName];
        }
        menuArray = localMenu;
        console.log(localMenu);
    }

    function switchTab() {
        for (let i = 0; i < view.children.length; i++) {
            if (i != currentTab) {
                view.children[i].style.display = "none";
            } else {
                view.children[i].style.display = "grid";
            }
        }
    }

    onMount(() => {
        console.log(view.children.length);
        if (view.children.length > 0) {
            init();
            switchTab();
        }
    });
</script>

<div class="tab-panel">
    <div class="overflow-ctrl">
        <menu onpointerdown={menuClick}>
            {#if menuArray?.length > 0}
                {#each menuArray as name, i}
                    <li><button data-tab-num={i}>{name}</button></li>
                {/each}
            {/if}
        </menu>
    </div>
    <div class="view" bind:this={view}>
        {@render children()}
    </div>
</div>

<style>
    .tab-panel {
        display: grid;
        grid-template-rows: auto 1fr;
        overflow: hidden;
        padding: 0.5em;
    }
    .overflow-ctrl {
        overflow: scroll;
        padding: 0 0 1em;
    }
    menu {
        list-style: none;
        display: flex;
    }
    button {
        padding: 0 1em;
    }
    .view {
        display: grid;
        overflow: scroll;
        background-color: coral;
    }
</style>
