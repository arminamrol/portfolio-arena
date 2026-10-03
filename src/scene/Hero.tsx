export function Hero() {
  return (
    // Placeholder box until the art pass. Raised by half its height so it
    // rests on the ground (a box's origin is its centre).
    <mesh position={[0, 0.75, 0]} castShadow>
      <boxGeometry args={[1, 1.5, 1]} />
      <meshStandardMaterial color="#d9a441" />
    </mesh>
  )
}
