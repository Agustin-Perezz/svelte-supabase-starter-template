<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';

  let { id, name, spriteUrl }: { id: string; name: string; spriteUrl: string } =
    $props();
</script>

<Card.Root class="transition-shadow hover:shadow-lg">
  <Card.Header class="items-center pb-2">
    <img
      src={spriteUrl}
      alt={name}
      width="96"
      height="96"
      class="h-24 w-24"
      loading="lazy"
    />
  </Card.Header>
  <Card.Content class="text-center">
    <Card.Title class="capitalize">{name}</Card.Title>
    <Card.Description>{id}</Card.Description>
  </Card.Content>
</Card.Root>
