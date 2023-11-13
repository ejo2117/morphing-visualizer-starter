import * as THREE from 'three'
import {
  addPass,
  useCamera,
  useGui,
  useRenderSize,
  useScene,
  useTick
} from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'

import vertexShader from './shaders/vertex.glsl' 
import fragmentShader from './shaders/fragment.glsl' 
import { SoftGlitchPass } from './shaders/passes/SoftGlitch.js'

import TRACK from './sounds/fire.mp3'
import gsap from 'gsap'

class Visualizer {
    constructor(mesh, frequencyUniformName) {
      // mesh setup
      this.mesh = mesh
      this.frequencyUniformName = frequencyUniformName
      this.mesh.material.uniforms[this.frequencyUniformName] = { value: 0 }

      // audio listener
      this.listener = new THREE.AudioListener()
      this.mesh.add(this.listener)

      // global audio source
      this.sound = new THREE.Audio(this.listener)
      this.loader = new THREE.AudioLoader()

      // analyser
      this.analyser = new THREE.AudioAnalyser(this.sound, 32)
    }

    load(path) {
      this.loader.load(path, (buffer) => {
        this.sound.setBuffer(buffer)
        this.sound.setLoop(true)
        this.sound.setVolume(0.5)
        this.sound.play()
      })
    }

    play() {
      if (this.sound.isPlaying) {
        this.sound.context.suspend()
        this.sound.context.resume()
      } else {

        this.sound.play()
      }
    }

    getFrequency() {
      return this.analyser.getAverageFrequency()
    }

    update() {
      // this acts like a gate, should be adjusted depending on the track!
      const freq = Math.max(this.getFrequency() - 100, 0) / 50;
      const freqUniform = this.mesh.material.uniforms[this.frequencyUniformName]
      
      gsap.to(freqUniform, {
        duration: 1.5,
        ease: 'Slow.easeOut',
        value: freq
      })

      return freq
    }
}

const startApp = () => {

  

  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()

  const ROTATION_SPEED = 0.02
  const MOTION_BLUR_AMOUNT = 0.725

  const dirLight = new THREE.DirectionalLight('#ffffff', 1)
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(dirLight, ambientLight)

  const geometry = new THREE.SphereGeometry(1, 100, 100)
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 }
    }
  })
  const ico = new THREE.Mesh(geometry, material)
  const wireframe = new THREE.LineSegments(geometry, material)
  const WIREFRAME_DELTA = 0.015
  wireframe.scale.setScalar(1 + WIREFRAME_DELTA)
  
  ico.add(wireframe)
  
  const visualizer = new Visualizer(ico, 'uAudioFrequency')
  visualizer.load(TRACK)

  const startButton = document.querySelector('#clickCapture button');
  startButton.addEventListener('click', e => {
    console.log({ e});
    const parent = e.target.parentElement;
    parent.remove()
    visualizer.play()
  })

  scene.add(ico)

  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  cameraFolder.open()

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  // save pass
  const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters))

  // blend pass
  const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
  blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
  blendPass.uniforms['mixRatio'].value = MOTION_BLUR_AMOUNT

  // output pass
  const outputPass = new ShaderPass(CopyShader)
  outputPass.renderToScreen = true

  // adding passes to composer
  addPass(blendPass)
  addPass(savePass)
  addPass(outputPass)

  const softGlitch = new SoftGlitchPass();
  softGlitch.factor = 1;
  addPass(softGlitch)

  const animateIco = () => {
    ico.rotation.x += ROTATION_SPEED
    ico.rotation.y += ROTATION_SPEED
  }

  useTick(({ timestamp, timeDiff }) => {
    // animateIco()
    material.uniforms.uTime.value = timestamp / 1000;
    const freq = visualizer.update()

    softGlitch.factor = freq > 0.6 ? 0.7 : 0.1;
  })
}

export default startApp;
