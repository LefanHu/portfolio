// Shared flat-shaded material and a frame-mutation helper for the altar scene.

export function Std({ color, roughness = 0.9 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} flatShading />;
}

/**
 * R3F mutates three objects every frame. The React Compiler lint rule flags
 * direct property writes on hook values, so route those writes through here.
 */
export function setProp<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]) {
  obj[key] = value;
}
