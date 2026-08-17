<script>
    import TabPanel from "./TabPanel.svelte";
    import TabContent from "./TabContent.svelte";
</script>

<div class="page">
    <TabPanel>
        <TabContent contentName="File">
            <div><h1>File</h1></div>
        </TabContent>
        <TabContent contentName="Edit">
            <div><h1>Edit</h1></div>
        </TabContent>
    </TabPanel>
    <TabPanel>
        <TabContent contentName="Animate">
            <div><h1>Animate</h1></div>
        </TabContent>
        <TabContent contentName="Layers">
            <div><h1>Layers</h1></div>
        </TabContent>
        <TabContent contentName="Graph">
            <div>
                <h1>Graph</h1>
            </div>
        </TabContent>

    </TabPanel>
</div>

<style>
    .page {
        height: 100vh;
        /* overflow: hidden; */
        background-color: rgb(247, 246, 246);
        display: grid;
        grid-template-columns: 300px 1fr;
        padding: .5em;
    }
</style>
