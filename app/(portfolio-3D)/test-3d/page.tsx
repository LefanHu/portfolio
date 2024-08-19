"use client";

import { Canvas } from "@react-three/fiber";
import { Box } from "@/components/Box";
import { AxeModel } from "@/components/Axe";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

export default function Test3dPage() {
  return (
    <div className="w-screen h-screen">
      <Canvas className="bg-white">
        <Suspense fallback={null} />
        <ambientLight intensity={Math.PI * 7} />
        {/* <spotLight */}
        {/*   position={[10, 10, 10]} */}
        {/*   angle={0.15} */}
        {/*   penumbra={1} */}
        {/*   decay={0} */}
        {/*   intensity={Math.PI} */}
        {/* /> */}
        <pointLight position={[-10, -10, -10]} decay={0} intensity={21 * Math.PI} />
        <pointLight position={[10, 10, 10]} decay={0} intensity={21 * Math.PI} />
        {/* <Box position={[-1.2, 0, 0]} /> */}
        {/* <Box position={[1.2, 0, 0]} /> */}
        <AxeModel position={[0, -1, -1]} />
        <OrbitControls />
        <Suspense />
      </Canvas>
    </div>
  );
}
