export type SettledPartition<T, K extends string = string> = {
  succeeded: T[];
  failed: Array<{ key: K; error: Error }>;
};

export function partitionSettled<T, K extends string = string>(
  results: PromiseSettledResult<T>[],
  keyForIndex: (index: number) => K = (i) => String(i) as K
): SettledPartition<T, K> {
  const succeeded: T[] = [];
  const failed: Array<{ key: K; error: Error }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      succeeded.push(result.value);
    } else {
      failed.push({
        key: keyForIndex(index),
        error:
          result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason))
      });
    }
  });

  return { succeeded, failed };
}
