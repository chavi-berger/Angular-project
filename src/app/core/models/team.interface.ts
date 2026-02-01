export interface Team {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  members_count?: number;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  name?: string;
  user_email?: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface CreateTeamDto {
  name: string;
}

export interface AddMemberDto {
  userId: number;
  role?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}
