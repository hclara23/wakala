export const projectTypeOptions = [
  { id: 'dumpster', label: 'Dumpster' },
  { id: 'washing', label: 'Washing' },
  { id: 'repairs', label: 'Repairs' },
  { id: 'cleanup', label: 'Cleanup' },
  { id: 'remodel', label: 'Remodel' },
  { id: 'hauling', label: 'Hauling' },
] as const;

export type ProjectTypeId = (typeof projectTypeOptions)[number]['id'];

export function isProjectTypeId(value: string): value is ProjectTypeId {
  return projectTypeOptions.some((option) => option.id === value);
}

export function getProjectTypeLabel(value: string) {
  const match = projectTypeOptions.find((option) => option.id === value);
  return match?.label || 'General';
}
