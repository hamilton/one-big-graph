<script>
  import page from "page";

  import { Button } from "@graph-paper/button";
  import { Stack } from "@graph-paper/stack";
  import { Box } from "@graph-paper/box";
  import Logo from "./components/Logo.svelte";
  import OneBigGraph from "./components/OneBigGraph.svelte";
  import Code from "./components/Code.svelte";
  import { site, plots } from "../public/config";

  let logo;

  let isNav = false;
  let currentPlot = plots[0];

  function toSQL(source) {
    return `${source.split(".").slice(0, -1).join(".")}.sql`;
  }

  function setPlot(key) {
    const nextPlot = plots.find((plot) => plot.key === key);
    if (nextPlot && currentPlot.key !== nextPlot.key) currentPlot = nextPlot;
  }

  function oneBigGraph(obj) {
    const { params } = obj;
    const { key } = params;

    setPlot(key);
  }

  page("/", oneBigGraph);
  page("/:key", oneBigGraph);
  page({ hashbang: true });

  async function graphs(source) {
    return Promise.all([
      fetch(`data/${source}`).then((r) => r.json()),
      fetch(`sql/${toSQL(source)}`).then((r) => r.text()),
    ]);
  }
</script>

<svelte:head>
  <title>{site.title || 'One Big Graph'}</title>
</svelte:head>

<nav
  on:mouseover={() => {
    isNav = true;
  }}
  on:mouseleave={() => {
    isNav = false;
  }}>
  <div>
    <Box padding={2}>
      <div style=" opacity: {isNav ? 1 : 0.5}; transition: opacity 300ms;">
        <Logo bind:this={logo} size={80} />
      </div>
    </Box>
    <Box pad={2}>
      <Stack space={1}>
        {#each plots as { shorthand, title, source, key }, i}
          <Button
            level="low"
            toggled={key === currentPlot.key}
            href={`/${key}`}
            on:click={() => {
              logo.rebuildLogo();
            }}>
            {shorthand || title}
          </Button>
        {/each}
      </Stack>
    </Box>
    <!-- footer -->
    {#if site.feedback}
      <Box padding={3}>
        <div
          style="padding-top: var(--space-4x); font-size: var(--text-02); color:
          var(--cool-gray-7500);">
          <div
            style="font-size: var(--text-015); text-transform: uppercase;color:
            var(--cool-gray-550); font-weight: bold;">
            feedback
          </div>
          {site.feedback}
        </div>
      </Box>
    {/if}

  </div>
</nav>
<main>
  <Stack space={2}>
    {#await graphs(currentPlot.source) then data}
      <OneBigGraph data={data[0]} plot={currentPlot} />
      <Code file={data[1]} />
      <Code file={JSON.stringify(currentPlot, null, 2)} language="javascript" />
    {/await}
  </Stack>
</main>
