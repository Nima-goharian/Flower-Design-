import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ThreeDModel({
  modelPath,
  position = [0, 0, 0],
  scale = [7, 7, 7],
  // New props:
  modelType = "flower", // "basket" or "flower"
  dragConstraints,      // e.g. { minX, maxX, minY, maxY }
  disablePointerEvents, // if true, pointer events are disabled (useful for basket when handled at a higher level)
}) {
  const { scene: originalScene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => (originalScene ? originalScene.clone(true) : null), [originalScene]);

  const groupRef = useRef();
  const rotationRef = useRef(new THREE.Euler(0, 0, 0));
  const positionRef = useRef(new THREE.Vector3(...position));
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  // Center the model.
  useEffect(() => {
    if (clonedScene) {
      clonedScene.scale.set(1, 1, 1);
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      clonedScene.position.sub(center);
    }
  }, [clonedScene]);

  // Make materials double-sided.
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.needsUpdate = true;
        }
      });
    }
  }, [clonedScene]);

  // Apply scaling.
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(...scale);
    }
  }, [scale]);

  // Update rotation and position each frame.
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.copy(rotationRef.current);
      groupRef.current.position.copy(positionRef.current);
    }
  });

  // Only attach pointer events if not disabled.
  const handlePointerDown = (e) => {
    if (disablePointerEvents) return;
    if (e.intersections && e.intersections.length > 0) {
      draggingRef.current = true;
      lastPointerRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
      e.stopPropagation();
    }
  };

  const handlePointerMove = (e) => {
    if (disablePointerEvents) return;
    if (!draggingRef.current) return;
    e.stopPropagation();
    const currentX = e.nativeEvent.clientX;
    const currentY = e.nativeEvent.clientY;
    const deltaX = currentX - lastPointerRef.current.x;
    const deltaY = currentY - lastPointerRef.current.y;
    lastPointerRef.current = { x: currentX, y: currentY };

    // Left-button: rotate.
    if (e.buttons === 1) {
      if (modelType === "basket") {
        // Only horizontal rotation.
        rotationRef.current.y += deltaX * 0.05;
      } else {
        // Flower: allow both X & Y rotation.
        rotationRef.current.y += deltaX * 0.05;
        rotationRef.current.x += deltaY * 0.05;
      }
    }
    // Right-button: translate (only for flowers).
    if (e.buttons === 2) {
      if (modelType !== "basket") {
        let newX = positionRef.current.x + deltaX * 0.01;
        let newY = positionRef.current.y - deltaY * 0.01;
        if (dragConstraints) {
          const { minX, maxX, minY, maxY } = dragConstraints;
          newX = Math.min(Math.max(newX, minX), maxX);
          newY = Math.min(Math.max(newY, minY), maxY);
        }
        positionRef.current.x = newX;
        positionRef.current.y = newY;
      }
    }
  };

  const handlePointerUp = (e) => {
    if (disablePointerEvents) return;
    draggingRef.current = false;
    e.stopPropagation();
  };

  const handleContextMenu = (e) => {
    if (disablePointerEvents) return;
    if (e.intersections && e.intersections.length > 0) {
      e.stopPropagation();
      if (e.nativeEvent?.preventDefault) {
        e.nativeEvent.preventDefault();
      }
    }
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}
