// Ground coordinates in percentages of the map. Segments follow the centre
// of the illustrated road. The array index is the destination challenge.
export const START = [10, 90.5];
export const STOPS = [START, [16.45,85.35], [19.9,61.55], [11.4,43.15],
  [28.55,20.7], [49.4,21.65], [62.65,29.65], [73,33.1], [80,39.2],
  [85.3,31], [93.55,26.2]];
export const ROADS = [[],
  [START,[11.4,90.1],[12.4,88.5],[13.1,86.8],[14.8,85.6],STOPS[1]],
  [STOPS[1],[19,86.7],[20.5,85.9],[21.7,83.1],[21.7,75],[22.5,73.2],[24.3,71],[25.1,68.5],[25.1,66],[23.3,63.3],STOPS[2]],
  [STOPS[2],[18.6,58.2],[16.2,55],[12.7,53.5],[10.1,51.8],[9.5,48.8],[10,46.2],STOPS[3]],
  [STOPS[3],[20.4,43.7],[22,43],[23.1,41],[23.3,38],[23.3,30.7],[24.8,27.5],[25.1,24.7],[26.3,22.6],STOPS[4]],
  [STOPS[4],[32.8,21.6],[34.8,22.2],[36.5,22.7],[46,22.7],STOPS[5]],
  [STOPS[5],[53.8,22.2],[55.8,23.7],[56.3,26.8],[57.3,28.8],[60,29.65],STOPS[6]],
  [STOPS[6],[65,30.4],[67.3,32.5],[69,33.1],STOPS[7]],
  [STOPS[7],[76,33.1],[77.4,34.3],[78,36],[78.5,38.1],STOPS[8]],
  [STOPS[8],[82.5,39],[84,38],[85.3,35.8],[85.3,33],STOPS[9]],
  [STOPS[9],[85.5,28.7],[87.4,27.2],[90.3,27.2],STOPS[10]],
];
export function nextChallenge(completed, count = 10) {
  for (let id = 1; id <= count; id++) if (!completed.includes(id)) return id;
  return count;
}
export function canAdvance(position, completed, count = 10) {
  return position >= 0 && position < count &&
    (position === 0 || Array.from({length:position}, (_, i) => i + 1).every(id => completed.includes(id)));
}
export function measureRoute(points) {
  const lengths = points.slice(1).map((point, i) =>
    Math.hypot((point[0] - points[i][0]) * 14.48, (point[1] - points[i][1]) * 10.86));
  return { points, lengths, distance: lengths.reduce((sum, n) => sum + n, 0) };
}
export function pointOnRoute(route, fraction) {
  let distance = Math.max(0, Math.min(1, fraction)) * route.distance;
  for (let i = 0; i < route.lengths.length; i++) {
    if (distance <= route.lengths[i]) {
      const t = route.lengths[i] ? distance / route.lengths[i] : 0;
      return route.points[i].map((n, axis) => n + (route.points[i + 1][axis] - n) * t);
    }
    distance -= route.lengths[i];
  }
  return route.points.at(-1);
}
