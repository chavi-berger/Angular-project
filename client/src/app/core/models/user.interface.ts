export interface User{
    id: number;
    name: string;
    email: string;
}

export interface Team{
    id: number;
    name: string;  
    members_count?: number;
    ownerId?: string;
}

export interface Project{
    id: number;
    name: string;
    teamId: string;
    description?: string;
}