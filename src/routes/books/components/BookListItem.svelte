<script lang="ts">
  import { enhance } from '$app/forms';

  let { id, title, author }: { id: string; title: string; author: string } =
    $props();
</script>

<li class="flex items-center justify-between rounded border p-4">
  <div>
    <p class="font-medium">{title}</p>
    <p class="text-sm text-gray-500">{author}</p>
  </div>
  <form method="POST" action="?/delete" use:enhance>
    <input type="hidden" name="id" value={id} />
    <button type="submit" class="text-sm text-red-600 hover:text-red-800"
      >Delete</button
    >
  </form>
</li>
