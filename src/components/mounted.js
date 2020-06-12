import { onMount } from "svelte";
import { writable } from "svelte/store";

export default function mounted() {
  const { set, subscribe } = writable(false);
  onMount(() => {
    set(true);
  });
  return { subscribe };
}
