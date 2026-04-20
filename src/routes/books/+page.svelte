<script lang="ts">
  import BookCreateForm from './components/BookCreateForm.svelte';

  const { data } = $props();
</script>

<svelte:head>
  <title>Books</title>
</svelte:head>

<main class="mx-auto max-w-2xl p-8">
  <h1 class="mb-6 text-2xl font-bold">Books</h1>

  <BookCreateForm createForm={data.createForm} />
</main>
