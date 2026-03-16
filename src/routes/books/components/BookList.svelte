<script lang="ts">
  import type { Book } from '$domain/models/book';

  import BookListItem from './BookListItem.svelte';

  let { books }: { books: Book[] } = $props();
</script>

<ul class="space-y-3">
  {#each books as book (book.id)}
    <BookListItem id={book.id} title={book.title} author={book.author} />
  {/each}
</ul>
