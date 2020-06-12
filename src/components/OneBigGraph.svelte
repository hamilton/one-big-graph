<script>
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { format } from "d3-format";
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { fly } from "svelte/transition";
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { timeFormat } from "d3-time-format";
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { schemeCategory10 } from "d3-scale-chromatic";
  import { DataGraphic } from "@graph-paper/datagraphic";
  import { Axis } from "@graph-paper/guides";
  import { Line, Point } from "@graph-paper/elements";

  import Window1D from "./Window1D.svelte";
  import MetricMouseover from "./StackedLabel.svelte";
  import DateMarker from "./DateMarker.svelte";

  export let data;
  export let plot;

  const defaults = {
    type: "line",
    tickColor: "var(--cool-gray-200)",
    labels: [],
    lineSize: [],
    group: undefined,
    xType: "time",
    yType: "linear",
    xTicks: undefined,
    yTicks: undefined,
  };

  const config = { ...defaults, ...plot };

  if (config.xType === "time") {
    data.forEach((di) => {
      const [year, month, day] = di[config.x].split("-");
      di[config.x] = new Date(+year, +month - 1, +day);
    });
  }

  function groupBy(key, d) {
    if (key === undefined) return [[undefined, d]];
    const groups = Array.from(new Set(d.map((di) => di[key])));
    return groups.map((gr) => {
      return [gr, d.filter((di) => di[key] === gr)];
    });
  }

  function toMouseover(pt) {
    // groups.map
    let mouseovers = pt
      .map(([group, d], j) => {
        return config.y.map((y, i) => {
          return {
            x: d[config.x],
            y: d[y],
            color: schemeCategory10[j * config.y.length + i],
            label:
              pt.length > 1 ? group : config.labels[i] || y + (group || ""),
          };
        });
      })
      .flat();
    return mouseovers;
  }
  let width;
  let height = 360;
  let right = 240;
  let left = 80;
  let top = 18;

  let ys = data.map((d) => config.y.map((y) => d[y])).flat();
  let yMin = config.yMin !== undefined ? config.yMin : Math.min(...ys);
  let yMax = config.yMax !== undefined ? config.yMax : Math.max(...ys);

  if (config.facet) {
    width = 350;
    height = 200;
    right = 8;
  }

  let mousePosition = {};

  let facetDateFormat = timeFormat("%b %d, %Y");
  let facetValueFormat = format(config.yMouseoverFormat || ",");
</script>

<style>
  header {
    padding-bottom: var(--space-8x);
    padding-left: calc(var(--space-1x) * 10);
  }

  header h1 {
    padding: 0px;
    margin: 0px;
    font-size: 2em;
    color: var(--cool-gray-800);
  }

  .supertitle {
    text-transform: uppercase;
    color: var(--cool-gray-600);
  }

  .subtitle {
    color: var(--cool-gray-600);
    font-style: italic;
  }

  .charts {
    display: flex;
    flex-wrap: wrap;
    grid-gap: var(--space-3x);
    padding-bottom: var(--space-4x);
  }

  h2 {
    margin: 0px;
    padding: 0px;
    font-size: var(--text-04);
    padding-bottom: var(--space-base);
  }
</style>

<div in:fly={{ duration: 400, y: 5 }}>
  {#if data.length}
    <header>
      {#if config.supertitle}
        <div class="supertitle">{config.supertitle}</div>
      {/if}
      <h1>{config.title}</h1>
      {#if config.subtitle}
        <div class="subtitle">{config.subtitle}</div>
      {/if}
    </header>
    <div class="charts" class:faceted={config.facet !== undefined}>
      {#each groupBy(config.facet, data) as [facet, facetData]}
        <div>
          {#if facet}
            <h2 style="padding-left:{left}px; padding-right: {right}px;">
              {facet}
            </h2>
          {/if}
          <DataGraphic
            xType={config.xType}
            yType={config.yType}
            {width}
            {height}
            bottom={32}
            {left}
            {top}
            xMin={config.xMin}
            xMax={config.xMax}
            {yMin}
            {yMax}
            bind:mousePosition
            {right}>
            <g slot="background">
              <Axis
                fontSize={config.facet ? '10px' : '13px'}
                side="bottom"
                lineStyle="long"
                ticks={config.xTicks}
                tickColor={config.tickColor}
                tickFormatter={config.xAxisFormat && format(config.xAxisFormat)} />
              <Axis
                side="left"
                fontSize={config.facet ? '10px' : '13px'}
                tickColor={config.tickColor}
                ticks={config.yTicks}
                tickFormatter={config.yAxisFormat && format(config.yAxisFormat)} />
            </g>
            <g slot="body">
              {#each groupBy(config.group, facetData) as [group, d], j (group)}
                {#each config.y as accessor, i (group + accessor)}
                  <Line
                    data={d}
                    x={config.x}
                    y={accessor}
                    color={schemeCategory10[j * config.y.length + i] || 'gray'}
                    size={config.lineSize[i] || 1} />
                {/each}
              {/each}
            </g>
            <g
              slot="annotation"
              let:xScale
              let:top
              let:bottom
              let:left
              let:right>
              <Window1D
                multi
                value={mousePosition.x}
                data={groupBy(config.group, facetData)}
                key={config.x}
                defaultValue="latest"
                let:output>
                {#if config.group || config.y.length > 1}
                  <DateMarker x={output[0][1][config.x]}>
                    {timeFormat('%b %d, %Y')(output[0][1][config.x])}
                  </DateMarker>
                  <g
                    transform="translate({xScale(output[0][1][config.x])}, 0)" />
                  {#if !facet || (facet && mousePosition.body)}
                    <MetricMouseover
                      springableWorkaround={mousePosition.x}
                      formatValue={format(config.yMouseoverFormat || ',')}
                      point={toMouseover(output)} />
                  {/if}
                {:else}
                  <DateMarker
                    x={output[0][1][config.x]}
                    showLine={mousePosition.body} />
                  <text
                    x={left}
                    y={top}
                    text-anchor="start"
                    font-size="12"
                    fill="var(--cool-gray-600)"
                    dy="-.75em"
                    style="text-transform: uppercase;">
                    {facetDateFormat(output[0][1][config.x])}
                  </text>
                  <text
                    x={right}
                    y={top}
                    text-anchor="end"
                    font-size="12"
                    fill="var(--cool-gray-600)"
                    dy="-.75em"
                    style="text-transform: uppercase;">
                    {facetValueFormat(output[0][1][config.y[0]])}
                  </text>
                  <Point
                    scaling={false}
                    x={output[0][1][config.x]}
                    y={output[0][1][config.y[0]]}
                    color={schemeCategory10[0]}
                    size={3} />
                {/if}
              </Window1D>
            </g>
          </DataGraphic>
        </div>
      {/each}
    </div>
  {/if}
</div>
