export type PaceSuggestion = {
  minPace: number
  maxPace: number
  minBpm: number
  maxBpm: number
}

// Starting points for the prototype; runners should adjust these to their own cadence.
export const paceSuggestions: PaceSuggestion[] = [
  { minPace: 9, maxPace: 20, minBpm: 145, maxBpm: 160 },
  { minPace: 8, maxPace: 8.99, minBpm: 150, maxBpm: 165 },
  { minPace: 7, maxPace: 7.99, minBpm: 155, maxBpm: 170 },
  { minPace: 6, maxPace: 6.99, minBpm: 160, maxBpm: 175 },
  { minPace: 5, maxPace: 5.99, minBpm: 165, maxBpm: 180 },
  { minPace: 4, maxPace: 4.99, minBpm: 170, maxBpm: 185 },
  { minPace: 3, maxPace: 3.99, minBpm: 175, maxBpm: 190 },
]

export function getSuggestion(pace: number) {
  return paceSuggestions.find(({ minPace, maxPace }) => pace >= minPace && pace <= maxPace)
    ?? paceSuggestions[0]
}
