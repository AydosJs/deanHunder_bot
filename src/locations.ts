export const floors = [1, 2, 3, 4] as const;

export function roomsForFloor(floor: number): number[] {
  const end = { 1: 20, 2: 30, 3: 40, 4: 50 }[floor as 1 | 2 | 3 | 4];
  if (!end) return [];
  return Array.from({ length: 10 }, (_, index) => floor * 100 + index + 1).filter((room) => room <= floor * 100 + end - 10);
}
