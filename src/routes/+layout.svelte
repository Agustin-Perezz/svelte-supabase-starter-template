<script lang="ts">
  import '../app.css';

  import { Toaster } from 'svelte-french-toast';

  let { children } = $props();
</script>

<Toaster />
{@render children()}
