export interface Rotation {
    id: number;
    name: string;
    busId: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RotationResponse extends Rotation {
    bus: { id: number; plate: string } | null;
    _count: { legs: number };
}
