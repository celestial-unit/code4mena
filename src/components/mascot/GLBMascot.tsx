import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface GLBMascotProps {
  size?: number;
  modelPath: string; // Path to your .glb file
}

export const GLBMascot: React.FC<GLBMascotProps> = ({ 
  size = 200, 
  modelPath 
}) => {
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<Renderer>();

  const onContextCreate = async (gl: any) => {
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(size, size);
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load GLB model
    const loader = new GLTFLoader();
    try {
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(
          modelPath,
          resolve,
          undefined,
          reject
        );
      });

      const model = gltf.scene;
      model.scale.set(2, 2, 2); // Adjust scale as needed
      scene.add(model);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate model
        if (model) {
          model.rotation.y += 0.01;
        }
        
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      
      animate();
    } catch (error) {
      console.error('Error loading GLB model:', error);
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GLView
        style={{ width: size, height: size }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});