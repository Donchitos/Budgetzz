export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserProgress {
  points: number;
  badges: Badge[];
}