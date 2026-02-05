import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Cylinder, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@mui/material';

const Bee = ({ position = [0, 0, 0], scale = 1, isGiant = false }) => {
    const groupRef = useRef();
    const leftWingRef = useRef();
    const rightWingRef = useRef();
    const { viewport, camera } = useThree();
    
    // Random offset for swarm wandering
    const randomOffset = useMemo(() => Math.random() * 100, []);
    const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime() + randomOffset;
        
        // Wing animation (always flapping)
        if (leftWingRef.current && rightWingRef.current) {
            const flapSpeed = isGiant ? 40 : 60; // Small bees flap faster
            const flapAmp = 0.5;
            const flapBase = 0.2;
            const flap = Math.sin(t * flapSpeed) * flapAmp;
            
            leftWingRef.current.rotation.z = flapBase + flap;
            rightWingRef.current.rotation.z = -flapBase - flap;
        }

        if (groupRef.current) {
            if (isGiant) {
                // Giant Bee Wandering Logic
                // Lissajous curve for organic wandering
                const x = Math.sin(t * 0.3) * 3;
                const y = Math.cos(t * 0.25) * 1.5;
                const z = Math.sin(t * 0.1) * 2; // Move in/out depth slightly

                // Smoothly interpolate to new position
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, x, delta * 0.5);
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, y, delta * 0.5);
                groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, z, delta * 0.5);

                // Slight rotation to face movement direction (approximated)
                groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
                groupRef.current.rotation.x = Math.cos(t * 0.25) * 0.1;

            } else {
                // Swarm Logic - Follow Cursor
                // Use state.mouse which is updated every frame
                // Calculate actual viewport width at the bee's z-depth
                const beeZ = -2;
                const depthFactor = (camera.position.z - beeZ) / camera.position.z;
                
                const targetX = (state.mouse.x * viewport.width / 2) * depthFactor;
                const targetY = (state.mouse.y * viewport.height / 2) * depthFactor;
                
                // Add some noise/separation so they don't all stack on top of each other
                const noiseX = Math.sin(t * 2) * 1.5;
                const noiseY = Math.cos(t * 3) * 1.5;
                
                // Lerp towards target + noise
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX + noiseX, delta * 3 * speed);
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + noiseY, delta * 3 * speed);
                
                // Dynamic lookAt logic could be added here, but simple tilt is enough for now
                groupRef.current.rotation.z = (targetX - groupRef.current.position.x) * -0.1;
                groupRef.current.rotation.x = (targetY - groupRef.current.position.y) * 0.1;
            }
        }
    });

    const materials = useMemo(() => ({
        body: new THREE.MeshStandardMaterial({ 
            color: '#F6C102', 
            roughness: 0.3, 
            metalness: 0.1 
        }),
        stripe: new THREE.MeshStandardMaterial({ 
            color: '#111111', 
            roughness: 0.4, 
            metalness: 0.2 
        }),
        eye: new THREE.MeshStandardMaterial({ 
            color: '#000000', 
            roughness: 0.1, 
            metalness: 0.8 
        }),
        wing: new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            roughness: 0.1,
            metalness: 0.1
        })
    }), []);

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Main Body */}
            <Sphere args={[0.9, 32, 32]} scale={[1, 1, 1.4]}>
                <primitive object={materials.body} />
            </Sphere>

            {/* Stripes */}
            <Cylinder args={[0.88, 0.88, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
                <primitive object={materials.stripe} />
            </Cylinder>
            <Cylinder args={[0.8, 0.8, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.4]}>
                <primitive object={materials.stripe} />
            </Cylinder>
             <Cylinder args={[0.5, 0.5, 0.15, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.9]}>
                <primitive object={materials.stripe} />
            </Cylinder>

            {/* Head */}
            <Sphere args={[0.65, 32, 32]} position={[0, 0.2, 1.1]}>
                <primitive object={materials.stripe} />
            </Sphere>

            {/* Eyes */}
            <Sphere args={[0.22, 16, 16]} position={[0.25, 0.3, 1.5]}>
                <primitive object={materials.eye} />
            </Sphere>
            <Sphere args={[0.22, 16, 16]} position={[-0.25, 0.3, 1.5]}>
                <primitive object={materials.eye} />
            </Sphere>

            {/* Antennae */}
            <group position={[0, 0.7, 1.3]} rotation={[0.4, 0, 0]}>
                <Cylinder args={[0.03, 0.03, 0.6]} position={[0.2, 0.3, 0]} rotation={[0, 0, -0.3]}>
                     <primitive object={materials.stripe} />
                </Cylinder>
                <Sphere args={[0.06, 8, 8]} position={[0.3, 0.6, 0]}>
                     <primitive object={materials.stripe} />
                </Sphere>

                <Cylinder args={[0.03, 0.03, 0.6]} position={[-0.2, 0.3, 0]} rotation={[0, 0, 0.3]}>
                     <primitive object={materials.stripe} />
                </Cylinder>
                 <Sphere args={[0.06, 8, 8]} position={[-0.3, 0.6, 0]}>
                     <primitive object={materials.stripe} />
                </Sphere>
            </group>

            {/* Wings */}
            <group position={[0, 0.8, 0.3]}>
                <group ref={leftWingRef} position={[0.2, 0, 0]} rotation={[0, 0, 0.2]}>
                     <mesh position={[0.9, 0, 0]} scale={[1, 0.02, 0.6]}>
                        <sphereGeometry args={[1.2, 32, 16]} />
                        <primitive object={materials.wing} />
                    </mesh>
                </group>

                <group ref={rightWingRef} position={[-0.2, 0, 0]} rotation={[0, 0, -0.2]}>
                    <mesh position={[-0.9, 0, 0]} scale={[1, 0.02, 0.6]}>
                         <sphereGeometry args={[1.2, 32, 16]} />
                         <primitive object={materials.wing} />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

const Swarm = ({ count = 10 }) => {
    // Generate random start positions
    const bees = useMemo(() => {
        return new Array(count).fill(0).map((_, i) => ({
            id: i,
            scale: 0.2 + Math.random() * 0.1, // Random small sizes
            startPos: [Math.random() * 10 - 5, Math.random() * 10 - 5, -2]
        }));
    }, [count]);

    return (
        <group>
            {bees.map(bee => (
                <Bee key={bee.id} position={bee.startPos} scale={bee.scale} />
            ))}
        </group>
    );
};

const UserBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF5E1 100%)', 
      }}
    >
        <Canvas 
            shadows 
            camera={{ position: [0, 0, 10], fov: 45 }}
            eventSource={typeof document !== 'undefined' ? document.body : undefined}
            eventPrefix="client"
        >
            <ambientLight intensity={1} />
            <directionalLight 
                position={[5, 10, 5]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
            />
            {/* Local lighting to avoid fetch errors */}
            <hemisphereLight intensity={0.5} groundColor="#ffaa00" />

            {/* Giant Bee */}
            
            {/* <Float 
                speed={5} 
                rotationIntensity={0.2} 
                floatIntensity={0.5} 
                floatingRange={[-0.8, 0.8]}
            >
                <Bee isGiant={true} scale={1.0} />
            </Float> */}

            {/* Cursor Swarm */}
            {/*<Swarm count={8} />*/}
        </Canvas>
    </Box>
  );
};

export default UserBackground;
