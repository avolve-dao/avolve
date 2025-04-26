"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      precision: "mediump", // Use medium precision for better performance
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Limit pixel ratio for performance
    containerRef.current.appendChild(renderer.domElement)

    // Create floating objects - use instanced mesh for better performance
    const geometry = new THREE.IcosahedronGeometry(1, 0)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })

    const objectCount = 5

    // Use instanced mesh for better performance with multiple objects
    const instancedMesh = new THREE.InstancedMesh(geometry, material, objectCount)
    scene.add(instancedMesh)

    // Set up instance matrices
    const dummy = new THREE.Object3D()
    const scales = []
    const rotationSpeeds = []

    for (let i = 0; i < objectCount; i++) {
      const scale = Math.random() * 1.5 + 0.5
      scales.push(scale)
      rotationSpeeds.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
      })

      dummy.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5 - 5)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      instancedMesh.setMatrixAt(i, dummy.matrix)
    }
    instancedMesh.instanceMatrix.needsUpdate = true

    // Position camera
    camera.position.z = 5

    // Mouse movement effect
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) / 100
      mouseY = (event.clientY - windowHalfY) / 100
    }

    document.addEventListener("mousemove", onDocumentMouseMove)

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop with frame limiting
    let lastTime = 0
    const fps = 30 // Limit to 30 FPS for better performance
    const fpsInterval = 1000 / fps

    const animate = (time: number) => {
      requestAnimationFrame(animate)

      // Calculate elapsed time
      const elapsed = time - lastTime

      // Only render if enough time has passed (frame limiting)
      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval)

        targetX = mouseX * 0.2
        targetY = mouseY * 0.2

        // Update instance matrices
        for (let i = 0; i < objectCount; i++) {
          instancedMesh.getMatrixAt(i, dummy.matrix)
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

          // Rotate objects
          dummy.rotation.x += rotationSpeeds[i].x
          dummy.rotation.y += rotationSpeeds[i].y

          // Subtle movement based on mouse
          dummy.position.x += ((targetX - dummy.position.x) * 0.01 * (i + 1)) / objectCount
          dummy.position.y += ((-targetY - dummy.position.y) * 0.01 * (i + 1)) / objectCount

          dummy.updateMatrix()
          instancedMesh.setMatrixAt(i, dummy.matrix)
        }

        instancedMesh.instanceMatrix.needsUpdate = true
        renderer.render(scene, camera)
      }
    }

    animate(0)

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("mousemove", onDocumentMouseMove)

      // Dispose resources
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 -z-5 pointer-events-none" aria-hidden="true" />
}
