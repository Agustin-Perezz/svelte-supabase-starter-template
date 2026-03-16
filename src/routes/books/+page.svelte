<script lang="ts">
  import { BooksPageState } from './booksPage.svelte';
  import BookCreateForm from './components/BookCreateForm.svelte';
  import BookEmptyState from './components/BookEmptyState.svelte';
  import BookList from './components/BookList.svelte';

  const { data } = $props();
  const state = $derived(new BooksPageState(data.books));
</script>

<svelte:head>
  <title>Books</title>
</svelte:head>

<main class="mx-auto max-w-2xl p-8">
  <h1 class="mb-6 text-2xl font-bold">Books</h1>

  <BookCreateForm createForm={data.createForm} />

  {#if state.hasBooks}
    <BookList books={state.books} />
  {:else}
    <BookEmptyState />
  {/if}
</main>
