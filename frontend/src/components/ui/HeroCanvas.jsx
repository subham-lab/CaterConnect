import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Scene setup ────────────────────────────────────
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Lighting ───────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const purpleLight = new THREE.PointLight(0x7c3aed, 2, 20)
    purpleLight.position.set(-4, 3, 2)
    scene.add(purpleLight)

    const blueLight = new THREE.PointLight(0x0ea5e9, 1.5, 20)
    blueLight.position.set(4, -2, 3)
    scene.add(blueLight)

    const whiteLight = new THREE.PointLight(0xffffff, 0.8, 15)
    whiteLight.position.set(0, 5, 1)
    scene.add(whiteLight)

    // ── Shared materials ───────────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.5,
      transparent: true,
      opacity: 0.7,
      envMapIntensity: 1,
    })

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x8b76ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })

    const solidMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.6,
      shininess: 80,
    })

    const accentMat = new THREE.MeshPhongMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.5,
      shininess: 60,
    })

    // ── Geometry objects ──────────────────────────────
    const objects = []

    // Large icosahedron — center-left
    const ico1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), glassMat)
    ico1.position.set(-2.5, 0.5, -1)
    scene.add(ico1)
    objects.push({ mesh: ico1, rotX: 0.003, rotY: 0.005, floatAmp: 0.12, floatSpeed: 0.8, base: ico1.position.y })

    // Wire icosahedron same position (layered)
    const ico1w = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), wireMat)
    ico1w.position.copy(ico1.position)
    scene.add(ico1w)
    objects.push({ mesh: ico1w, rotX: -0.002, rotY: 0.004, floatAmp: 0.12, floatSpeed: 0.8, base: ico1w.position.y })

    // Octahedron — right
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), solidMat.clone())
    oct.material.color.set(0x38bdf8)
    oct.position.set(2.8, -0.3, 0)
    scene.add(oct)
    objects.push({ mesh: oct, rotX: 0.006, rotY: 0.004, floatAmp: 0.18, floatSpeed: 1.1, base: oct.position.y })

    // Torus — top right
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.18, 16, 60),
      accentMat,
    )
    torus.position.set(1.8, 2.0, -0.5)
    scene.add(torus)
    objects.push({ mesh: torus, rotX: 0.008, rotY: 0.003, floatAmp: 0.1, floatSpeed: 0.9, base: torus.position.y })

    // Small icosahedra — scattered
    const smalls = [
      { pos: [3.5, 1.5, -2],  size: 0.35, col: 0x7c3aed },
      { pos: [-3.2, -1.8, -1], size: 0.28, col: 0x0ea5e9 },
      { pos: [0.8, -2.5, 0.5], size: 0.22, col: 0xc084fc },
      { pos: [-1.5, 2.5, -2], size: 0.3,  col: 0x38bdf8 },
      { pos: [4.0, -1.0, -1.5], size: 0.2, col: 0x7c3aed },
    ]
    smalls.forEach(({ pos, size, col }, i) => {
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.55, shininess: 90 })
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), mat)
      mesh.position.set(...pos)
      scene.add(mesh)
      objects.push({
        mesh,
        rotX: 0.004 + i * 0.002,
        rotY: 0.006 + i * 0.001,
        floatAmp: 0.08 + i * 0.02,
        floatSpeed: 0.6 + i * 0.15,
        base: mesh.position.y,
      })
    })

    // Particle field
    const particleCount = 180
    const positions     = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 18
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    }
    const partGeo = new THREE.BufferGeometry()
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const partMat = new THREE.PointsMaterial({ color: 0x8b76ff, size: 0.035, transparent: true, opacity: 0.5 })
    const particles = new THREE.Points(partGeo, partMat)
    scene.add(particles)

    // ── Mouse parallax ─────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Animation loop ─────────────────────────────────
    let frame
    const clock = new THREE.Clock()

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth camera parallax
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04
      camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.04
      camera.lookAt(scene.position)

      // Animate each object
      objects.forEach((obj) => {
        obj.mesh.rotation.x += obj.rotX
        obj.mesh.rotation.y += obj.rotY
        obj.mesh.position.y = obj.base + Math.sin(t * obj.floatSpeed) * obj.floatAmp
      })

      // Slowly rotate particle field
      particles.rotation.y = t * 0.02
      particles.rotation.x = t * 0.01

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ─────────────────────────────────
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" style={{ minHeight: '100vh' }} />
}
