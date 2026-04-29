<script lang="ts" module>
  export type ImageUploadProps = {
    maxFiles?: number;
    maxFileSize?: number;
    accept?: string;
    onFileRejected?: (opts: { reason: string; file: File }) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';
  import { SvelteDate } from 'svelte/reactivity';
  import XIcon from '@lucide/svelte/icons/x';

  import { errorToast } from '$lib/alerts/toast';
  import { Button } from '$lib/components/ui/button';
  import * as FileDropZone from '$lib/components/ui/file-drop-zone';
  import { Progress } from '$lib/components/ui/progress';
  import { cn } from '$lib/utils.js';
  import { sleep } from '$lib/utils/sleep';

  type UploadedFile = {
    name: string;
    type: string;
    size: number;
    uploadedAt: number;
    url: Promise<string>;
  };

  let {
    maxFiles = 4,
    maxFileSize = 3 * FileDropZone.MEGABYTE,
    accept = 'image/*',
    onFileRejected,
    class: className
  }: ImageUploadProps = $props();

  let files = $state<UploadedFile[]>([]);
  let date = new SvelteDate();

  const onUpload: FileDropZone.FileDropZoneRootProps['onUpload'] = async (
    incoming
  ) => {
    await Promise.allSettled(incoming.map((file) => uploadFile(file)));
  };

  const handleFileRejected: FileDropZone.FileDropZoneRootProps['onFileRejected'] =
    async ({ reason, file }) => {
      if (onFileRejected) {
        onFileRejected({ reason, file });
      } else {
        errorToast(`${file.name} failed to upload! ${reason}`);
      }
    };

  const uploadFile = async (file: File) => {
    if (files.find((f) => f.name === file.name)) return;

    const urlPromise = new Promise<string>((resolve) => {
      sleep(500).then(() => resolve(URL.createObjectURL(file)));
    });

    files.push({
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: Date.now(),
      url: urlPromise
    });

    await urlPromise;
  };

  const removeFile = async (index: number, url: string) => {
    URL.revokeObjectURL(url);
    files = [...files.slice(0, index), ...files.slice(index + 1)];
  };

  onDestroy(async () => {
    for (const file of files) {
      URL.revokeObjectURL(await file.url);
    }
  });

  $effect(() => {
    const interval = setInterval(() => {
      date.setTime(Date.now());
    }, 10);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<div class={cn('flex w-full flex-col gap-2', className)}>
  <FileDropZone.Root
    {onUpload}
    onFileRejected={handleFileRejected}
    {maxFileSize}
    {accept}
    {maxFiles}
    fileCount={files.length}
  >
    <FileDropZone.Trigger />
  </FileDropZone.Root>

  <div class="flex flex-col gap-2">
    {#each files as file, i (file.name)}
      <div class="flex place-items-center justify-between gap-2">
        <div class="flex place-items-center gap-2">
          {#await file.url then src}
            <div class="relative size-9 overflow-clip">
              <img
                {src}
                alt={file.name}
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"
              />
            </div>
          {/await}
          <div class="flex flex-col">
            <span class="text-nowrap">{file.name}</span>
            <span class="text-muted-foreground text-xs"
              >{FileDropZone.displaySize(file.size)}</span
            >
          </div>
        </div>
        {#await file.url}
          <Progress
            class="h-2 w-full grow"
            value={((date.getTime() - file.uploadedAt) / 500) * 100}
            max={100}
          />
        {:then url}
          <Button
            variant="outline"
            size="icon"
            onclick={() => removeFile(i, url)}
          >
            <XIcon />
          </Button>
        {/await}
      </div>
    {/each}
  </div>
</div>
