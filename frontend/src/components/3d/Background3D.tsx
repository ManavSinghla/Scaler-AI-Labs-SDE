import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThemeType } from '../../types/form';

interface Background3DProps {
  theme?: ThemeType;
  stepIndex?: number;
}

const themeColors: Record<ThemeType, { primary: number; secondary: number; bg: string; fog: number }> = {
  cyber_neon: {
    primary: 0x00f0ff,
    secondary: 0x7000ff,
    bg: 'linear-gradient(135deg, #090d16 0%, #05050e 100%)',
    fog: 0x090d16,
  },
  deep_space: {
    primary: 0x6366f1,
    secondary: 0xf59e0b,
    bg: 'linear-gradient(135deg, #0b0f19 0%, #030712 100%)',
    fog: 0x0b0f19,
  },
  sunset_glass: {
    primary: 0xf97316,
    secondary: 0xec4899,
    bg: 'linear-gradient(135deg, #180d14 0%, #0a0408 100%)',
    fog: 0x180d14,
  },
  emerald_dark: {
    primary: 0x10b981,
    secondary: 0x06b6d4,
    bg: 'linear-gradient(135deg, #041410 0%, #020a08 100%)',
    fog: 0x041410,
  },
};

export const Background3D: React.FC<Background3DProps> = ({ theme = 'cyber_neon', stepIndex = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mainMesh: THREE.Mesh;
    wireMesh: THREE.Mesh;
    particles: THREE.Points;
    targetRotationX: number;
    targetRotationY: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const currentTheme = themeColors[theme] || themeColors.cyber_neon;
    scene.fog = new THREE.FogExp2(currentTheme.fog, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Geometries
    const geometry = new THREE.TorusKnotGeometry(4.2, 1.3, 128, 32);

    const material = new THREE.MeshStandardMaterial({
      color: currentTheme.primary,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false,
      transparent: true,
      opacity: 0.35,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: currentTheme.secondary,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    const mainMesh = new THREE.Mesh(geometry, material);
    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    scene.add(mainMesh);
    scene.add(wireMesh);

    // Particle Stars Field
    const particlesCount = 350;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: currentTheme.primary,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(currentTheme.primary, 3, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(currentTheme.secondary, 3, 50);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      mainMesh,
      wireMesh,
      particles,
      targetRotationX: 0,
      targetRotationY: 0,
    };

    // Parallax mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      sceneRef.current.targetRotationY = mouseX * 0.4;
      sceneRef.current.targetRotationX = mouseY * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!sceneRef.current) return;
      const { camera, renderer } = sceneRef.current;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!sceneRef.current) return;

      const elapsedTime = clock.getElapsedTime();
      const { mainMesh, wireMesh, particles, camera, targetRotationX, targetRotationY, renderer, scene } =
        sceneRef.current;

      // Smooth rotation
      mainMesh.rotation.y = elapsedTime * 0.15 + targetRotationY;
      mainMesh.rotation.x = elapsedTime * 0.1 + targetRotationX;
      wireMesh.rotation.y = elapsedTime * 0.15 + targetRotationY;
      wireMesh.rotation.x = elapsedTime * 0.1 + targetRotationX;

      // Particle float
      particles.rotation.y = elapsedTime * 0.04;

      // Gentle camera breath
      camera.position.x += (targetRotationY * 2 - camera.position.x) * 0.05;
      camera.position.y += (-targetRotationX * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  // Step Index Reaction: rotate mesh on question step change
  useEffect(() => {
    if (!sceneRef.current) return;
    const { mainMesh, wireMesh } = sceneRef.current;
    mainMesh.rotation.z = stepIndex * 0.45;
    wireMesh.rotation.z = stepIndex * 0.45;
  }, [stepIndex]);

  const currentTheme = themeColors[theme] || themeColors.cyber_neon;

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-colors duration-700 -z-10"
      style={{ background: currentTheme.bg }}
    >
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
    </div>
  );
};
