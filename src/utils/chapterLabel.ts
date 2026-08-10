const supplementalChapterNames = new Set(["Dhyana Slokas", "Gita Mahatyam"]);

export function isSupplementalChapter(chapterName?: string): boolean {
  return chapterName !== undefined && supplementalChapterNames.has(chapterName);
}

export function formatChapterLabel(
  chapterNumber: number | undefined,
  chapterName: string | undefined,
  prefix: "Chapter" | "Ch" = "Chapter",
): string {
  if (isSupplementalChapter(chapterName)) {
    return chapterName ?? "";
  }

  const number = chapterNumber ?? "-";
  return chapterName
    ? `${prefix} ${number} - ${chapterName}`
    : `${prefix} ${number}`;
}
