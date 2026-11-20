import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const VIOLETA = '#4f2ff0';
const TINTA = '#1b1647';
const SENAL = '#ff5a1f';
const SUELO = -0.98;

function Rueda({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.38, 0.38, 0.32, 36]} />
        <meshStandardMaterial color={TINTA} roughness={0.55} />
      </mesh>
      {[-0.17, 0.17].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 28]} />
          <meshStandardMaterial color={VIOLETA} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Bus() {
  return (
    <group>
      <RoundedBox args={[4.8, 1.6, 1.8]} radius={0.32} smoothness={6}>
        <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
      </RoundedBox>
      <RoundedBox args={[4.84, 0.5, 1.84]} radius={0.2} smoothness={4} position={[0, -0.55, 0]}>
        <meshPhysicalMaterial color={VIOLETA} roughness={0.3} clearcoat={0.8} />
      </RoundedBox>
      {/* ventanas laterales */}
      <RoundedBox args={[4.0, 0.55, 1.86]} radius={0.12} smoothness={4} position={[-0.2, 0.3, 0]}>
        <meshPhysicalMaterial color={TINTA} metalness={0.9} roughness={0.08} clearcoat={1} />
      </RoundedBox>
      {/* parabrisas */}
      <RoundedBox args={[0.12, 0.85, 1.5]} radius={0.05} position={[2.4, 0.2, 0]}>
        <meshPhysicalMaterial color={TINTA} metalness={0.9} roughness={0.08} />
      </RoundedBox>
      {/* línea de luz y faros en naranja señal */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[4.7, 0.035, 1.86]} />
        <meshBasicMaterial color={SENAL} toneMapped={false} />
      </mesh>
      {[-0.6, 0.6].map((z) => (
        <mesh key={z} position={[2.42, -0.4, z]}>
          <boxGeometry args={[0.06, 0.14, 0.34]} />
          <meshBasicMaterial color={SENAL} toneMapped={false} />
        </mesh>
      ))}
      <RoundedBox args={[1.3, 0.2, 0.9]} radius={0.08} position={[0.3, 0.9, 0]}>
        <meshStandardMaterial color="#e9e5ff" roughness={0.4} />
      </RoundedBox>
      {[1.55, -1.5].flatMap((x) => [0.88, -0.88].map((z) => <Rueda key={`${x}${z}`} position={[x, -0.62, z]} />))}
    </group>
  );
}

// Punto naranja que recorre el anillo: la "ruta" del bus
function Orbita({ animado }: { animado: boolean }) {
  const punto = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!punto.current || !animado) return;
    const t = clock.elapsedTime * 0.55;
    punto.current.position.set(Math.cos(t) * 3.6, SUELO + 0.05, Math.sin(t) * 3.6);
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SUELO + 0.02, 0]}>
        <torusGeometry args={[3.6, 0.014, 12, 160]} />
        <meshBasicMaterial color={VIOLETA} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SUELO + 0.02, 0]}>
        <torusGeometry args={[4.5, 0.008, 12, 160]} />
        <meshBasicMaterial color="#9a8bff" toneMapped={false} />
      </mesh>
      <mesh ref={punto} position={[3.6, SUELO + 0.05, 0]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshBasicMaterial color={SENAL} toneMapped={false} />
      </mesh>
    </group>
  );
}

// El bus sigue al puntero y gira un poco al hacer scroll
function Plataforma({ animado }: { animado: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }, dt) => {
    const g = grupo.current;
    if (!g) return;
    const base = -0.55 + (animado ? Math.sin(clock.elapsedTime * 0.35) * 0.12 : 0);
    const objetivoY = base + (animado ? pointer.x * 0.45 + Math.min(window.scrollY, 900) * 0.0016 : 0);
    const objetivoX = animado ? -pointer.y * 0.12 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, objetivoY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, objetivoX, 3, dt);
    g.position.y = animado ? Math.sin(clock.elapsedTime * 0.9) * 0.06 : 0;
  });
  return (
    <group ref={grupo}>
      <Bus />
    </group>
  );
}

export default function BusScene({ animado = true }: { animado?: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [6.2, 2.5, 6.4], fov: 32 }} frameloop={animado ? 'always' : 'demand'} gl={{ antialias: true, alpha: true }} aria-label="Modelo 3D de un bus de Reserbus">
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 4]} intensity={1.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -5]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#8b7bff" />
        <Lightformer form="ring" intensity={2.4} position={[4, 1, 4]} scale={3} color={SENAL} />
      </Environment>
      <Plataforma animado={animado} />
      <Orbita animado={animado} />
      {animado && <Sparkles count={46} scale={[9, 3.5, 9]} size={3.2} speed={0.35} color="#7a63ff" opacity={0.8} />}
      <ContactShadows position={[0, SUELO, 0]} opacity={0.38} scale={12} blur={2.6} far={4} color="#2f1ba8" />
    </Canvas>
  );
}
