import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$modules/shared/domain/database.types';

import { partitionSettled } from '$lib/modules/shared/utils/promises';

type StorageFileApi = ReturnType<SupabaseClient<Database>['storage']['from']>;

export type FileBody = Parameters<StorageFileApi['upload']>[1];
export type StorageUploadOptions = NonNullable<
  Parameters<StorageFileApi['upload']>[2]
>;
export type StorageUploadResult = NonNullable<
  Awaited<ReturnType<StorageFileApi['upload']>>['data']
>;
export type StorageDeleteFileObject = NonNullable<
  Awaited<ReturnType<StorageFileApi['remove']>>['data']
>[number];

export type StorageFileInput = {
  path: string;
  body: FileBody;
  options?: StorageUploadOptions;
};

export type StorageBulkResult<T> = {
  succeeded: T[];
  failed: Array<{ path: string; error: Error }>;
};

export type StorageDeleteResult = {
  deletedPaths: string[];
  error: Error | null;
};

export abstract class SupabaseStorageRepository {
  protected abstract bucket: string;

  constructor(protected readonly supabase: SupabaseClient<Database>) {}

  async upload(
    path: string,
    body: FileBody,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, body, options);

    if (error) {
      throw error;
    }

    return data;
  }

  async bulkUpload(
    files: StorageFileInput[]
  ): Promise<StorageBulkResult<StorageUploadResult>> {
    const results = await Promise.allSettled(
      files.map((file) => this.upload(file.path, file.body, file.options))
    );

    const { succeeded, failed } = partitionSettled(
      results,
      (index) => files[index].path
    );

    return {
      succeeded,
      failed: failed.map(({ key: path, error }) => ({ path, error }))
    };
  }

  async bulkDelete(paths: string[]): Promise<StorageDeleteResult> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .remove(paths);

    if (error) {
      return { deletedPaths: [], error };
    }

    const deletedPaths = data.map((file) => file.name);

    return { deletedPaths, error: null };
  }
}
