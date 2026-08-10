export function generateSlokaOptions(totalSlokas: number): number[] {
  if (!Number.isInteger(totalSlokas) || totalSlokas <= 0) {
    return [];
  }

  const options: number[] = [];

  for (let slokaCount = 5; slokaCount <= totalSlokas; slokaCount += 5) {
    options.push(slokaCount);
  }

  if (options.at(-1) !== totalSlokas) {
    options.push(totalSlokas);
  }

  return options;
}
