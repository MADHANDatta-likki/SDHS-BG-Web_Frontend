export interface AllowedSlokasQuery {
  volunteerId: string;
  date: string;
  chapterId: number;
}

export interface AllowedSlokasResponse {
  allowed: number[];
  minNext?: number;
}
