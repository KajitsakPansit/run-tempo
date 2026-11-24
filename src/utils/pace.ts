export function formatPace(pace: number) {
  return pace.toFixed(2)
}

export function paceFromSlider(value: string) {
  return Number(value) / 100
}
