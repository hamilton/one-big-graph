<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { elasticOut } from "svelte/easing";

  export let size = 48;
  export let params = { duration: 1000, y: -5, easing: elasticOut };

  function unif(v) {
    return (Math.random() - 0.5) * v;
  }

  function makeLogo() {
    let bases = [
      {
        d:
          "M57.743,114.987L0.5,86.365L57.743,57.743L114.987,86.365L57.743,114.987Z",
      },
      {
        d:
          "M57.743,86.365L0.5,57.743L57.743,29.122L114.987,57.743L57.743,86.365Z",
      },
      {
        d: "M57.743,57.743L0.5,29.122L57.743,0.5L114.987,29.122L57.743,57.743Z",
      },

      {
        d:
          "M57.743,114.987L0.5,86.365L0.5,29.122L57.743,57.743L57.743,114.987Z",
      },
      {
        d:
          "M85.743,100.365L28.5,71.743L28.5,14.5L85.743,43.122L85.743,100.365Z",
      },
      {
        d:
          "M114.987,86.365L57.743,57.743L57.743,0.5L114.987,29.122L114.987,86.365Z",
      },

      {
        d:
          "M57.743,114.987L114.987,86.365L114.987,29.122L57.743,57.743L57.743,114.987Z",
      },
      {
        d:
          "M28.743,100.865L85.987,72.243L85.987,15L28.743,43.622L28.743,100.865Z",
      },
      { d: "M0.5,86.365L57.743,57.743L57.743,0.5L0.5,29.122L0.5,86.365Z" },
    ];

    let r = Math.random() / 3;
    bases = bases.map((b, i) => {
      const bi = { ...b };
      bi.render = Math.random() > 0.25;
      const p = i / 9;
      const z = (i % 3) * r;
      const mid = i % 3 === 1;
      // bi.color = `hsl(${r * 3 * 365 * p}, 100%, ${30 + (i / 9) * 100 * 0.7}%)`;
      bi.color = `hsl(246, 60%, ${50 + (i / 9) * 100 * 0.2}%)`;
      bi.params = {
        ...params,
        x: unif(40),
        y: unif(40),
      };
      bi.dx = mid ? unif(10) : 0;
      // bi.dy = mid ? unif(10) : 0;
      bi.fill = Math.random() / 6;
      return bi;
    });

    bases.sort(() => {
      if (Math.random()) return -1;
      return 1;
    });
    return bases;
  }

  let bases = makeLogo();

  let showLattice = true;
  onMount(() => {
    showLattice = true;
  });

  export function rebuildLogo() {
    bases = makeLogo();
  }
</script>

<style>
  g {
    transition: opacity 200ms, fill 200ms, fill-opacity 200ms, stroke 200ms;
  }
</style>

{#if showLattice}
  <svg
    transition:fly={{ duration: 2000, y: -20 * unif(1), easing: elasticOut }}
    width={size}
    height={size}
    viewBox="-20 -20 156 156"
    style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g
      transition:fly={{ duration: 1000, x: -20 * unif(1), easing: elasticOut }}>
      {#each bases as base, i}
        <g style="opacity:{base.render ? 1 : 0}">
          <path
            in:fly={base.params}
            d={base.d}
            style="transform:translateY({base.dy}px) translateX({base.dx}px);
            fill:{base.color}; fill-opacity: {base.fill}; stroke:{base.color};
            stroke-width:5px;" />
        </g>
      {/each}
    </g>
  </svg>
{/if}
