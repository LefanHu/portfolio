import { BoxBlendGeometry } from "../geometries/boxBlendGeometry";

export function BoxBlend(
  props: JSX.IntrinsicElements["mesh"] & {
    width?: number;
    height?: number;
    radius?: number;
    depth?: number;
  }
) {
  return (
    <mesh {...props}>
      <BoxBlendGeometry
        width={props.width}
        height={props.height}
        radius={props.radius}
      />
      <meshStandardMaterial color={"tomato"} />
    </mesh>
  );
}
