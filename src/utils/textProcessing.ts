export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  sentences: number;
}

export interface TextSegment {
  text: string;
  highlighted: boolean;
}

export interface SearchResult {
  count: number;
  positions: number[];
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function countCharacters(text: string, withSpaces = true): number {
  if (!text) return 0;
  return withSpaces ? text.length : text.replace(/\s/g, '').length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

export function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const matches = text.match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : (text.trim().length > 0 ? 1 : 0);
}

export function getTextStats(text: string): TextStats {
  return {
    words: countWords(text),
    characters: countCharacters(text, true),
    charactersNoSpaces: countCharacters(text, false),
    lines: countLines(text),
    sentences: countSentences(text),
  };
}

export function cleanText(text: string): string {
  return text
    .replace(/[^\S\n]+/g, ' ')       // collapse multiple spaces (keep newlines)
    .replace(/\n{3,}/g, '\n\n')       // max 2 consecutive newlines
    .replace(/^ +| +$/gm, '')        // trim each line
    .trim();
}

export function searchInText(text: string, query: string): SearchResult {
  if (!query || !text) return { count: 0, positions: [] };

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const positions: number[] = [];
  let pos = 0;

  while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
    positions.push(pos);
    pos += lowerQuery.length;
  }

  return { count: positions.length, positions };
}

export function highlightMatches(text: string, query: string): TextSegment[] {
  if (!query || !text) return [{ text, highlighted: false }];

  const segments: TextSegment[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  let pos = 0;
  while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
    if (pos > lastIndex) {
      segments.push({ text: text.slice(lastIndex, pos), highlighted: false });
    }
    segments.push({ text: text.slice(pos, pos + query.length), highlighted: true });
    lastIndex = pos + query.length;
    pos += query.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlighted: false });
  }

  return segments.length > 0 ? segments : [{ text, highlighted: false }];
}

export function getConfidenceLabel(confidence: number): { label: string; color: string } {
  if (confidence >= 90) return { label: 'Excellent', color: '#4ade80' };
  if (confidence >= 70) return { label: 'High', color: '#22d3ee' };
  if (confidence >= 50) return { label: 'Medium', color: '#fbbf24' };
  return { label: 'Low', color: '#f87171' };
}
