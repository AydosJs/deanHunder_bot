export const floors = [1, 2, 3, 4] as const;
export type Floor = typeof floors[number];

// Building 1 room directory, with lecture labels supplied in the I-54/24i screenshot.
// Keep numeric identifiers for compatibility with existing Supabase sightings.
export const roomLabelsByFloor: Record<Floor, readonly string[]> = {
  "1": [
    "1/111",
    "1/115-100",
    "1/116",
    "1/117",
    "1/118-100",
    "1/119",
    "1/120",
    "1/121",
    "1/125(Ural)-35",
    "1/126",
    "1/131(Ural)-100",
    "1/132(Ural)",
    "1/133(Ural)-44",
    "1/134(Ural)-100",
    "1/135(Ural)-50",
    "1/136(Ural)SH-25",
    "1/137(Ural)-50",
    "1/138(Ural)-50",
    "1/139(Ural)-35"
  ],
  "2": [
    "1/211",
    "1/212-66",
    "1/216-64",
    "1/217-30",
    "1/218-30",
    "1/219-72",
    "1/221-95",
    "1/222-30",
    "1/227",
    "1/228-65",
    "1/232-67",
    "1/233-30",
    "1/234-20",
    "1/235-67",
    "1/236L",
    "1/238-30",
    "1/239-20"
  ],
  "3": [
    "1/311-30",
    "1/312-44",
    "1/316-72",
    "1/317-30",
    "1/318-30",
    "1/319-72",
    "1/321-81",
    "1/322-30",
    "1/323-30",
    "1/324(M)",
    "1/325-30",
    "1/326-30",
    "1/327-64",
    "1/331L",
    "1/332-30",
    "1/333-30",
    "1/334-72",
    "1/335L",
    "1/337-30",
    "1/338(M)"
  ],
  "4": [
    "1/410-30",
    "1/411-30",
    "1/416-120",
    "1/417-70",
    "1/418-80",
    "1/420-30",
    "1/421-30",
    "1/424-30",
    "1/425-60",
    "1/429-70",
    "1/430-80",
    "1/431-80",
    "1/433-30",
    "1/434-30"
  ]
};

export function roomsForFloor(floor: number): number[] {
  const labels = roomLabelsByFloor[floor as Floor] ?? [];
  return labels.map(label => Number(label.match(/^1\/(\d{3})/)![1]));
}
export function roomLabel(floor: number, room: number): string {
  return (roomLabelsByFloor[floor as Floor] ?? [])
    .find(label => Number(label.match(/^1\/(\d{3})/)![1]) === room) ?? '1/' + room;
}
