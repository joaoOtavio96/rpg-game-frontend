export interface GameObject{
  name: String;
  sprite: string,
  x: number;
  y: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  hasCollision: boolean;
  collisionBodies: CollisionBody[];
}

export interface CollisionBody{
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  hasCollision: boolean;
}
