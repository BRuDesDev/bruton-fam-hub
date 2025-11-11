export interface EventRecord {
  id: number;
  title: string;
  when: string;
  notes: string | null;
  created_at: string;
}

export interface EventPayload {
  title: string;
  when: string;
  notes?: string;
}
