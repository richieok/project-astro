<script>
    let { children, contentName } = $props();
</script>

<div data-content-name={contentName}>
    {@render children()}
</div>

<style>
    [data-content-name] {
        display: none;
    }
</style>
