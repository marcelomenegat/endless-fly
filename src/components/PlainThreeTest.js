import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import '../App.css';
import Stats from 'stats.js'

const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
  summer: 0xf7d9aa
};

export class Planet {
  constructor() {
    let geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10 );
    // var geometry = new THREE.CylinderGeometry(400, 400, 250, 80, 60 ); // #NOTE: Nao precisa usar o planet.mesh.position.y = -200 :> loop()
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // #NOTE: MeshPhongMaterial requires use of lights
    let material = new THREE.MeshPhongMaterial({
      color: Colors.blue,
      transparent: true,
      opacity: 0.6,
      flatShading : THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
  }
}

export class Cloud {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "cloud";
    let geom = new THREE.BoxGeometry(20,20,20);
    let mat = new THREE.MeshPhongMaterial({
      color:Colors.white,
    });

    let nBlocs = 3+Math.floor(Math.random()*3);
    for (let i=0; i<nBlocs; i++ ){
      let m = new THREE.Mesh(geom.clone(), mat);
      m.position.x = i*15;
      m.position.y = Math.random()*10;
      m.position.z = Math.random()*10;
      m.rotation.z = Math.random()*Math.PI*2;
      m.rotation.y = Math.random()*Math.PI*2;
      let s = .1 + Math.random()*.9;
      m.scale.set(s,s,s);
      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
    }
  }
}

export class Sky {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    let stepAngle = Math.PI*2 / this.nClouds;
    for(let i=0; i<this.nClouds; i++){
      let c = new Cloud();
      this.clouds.push(c);
      let a = stepAngle*i;
      let h = 750 + Math.random()*200;
      c.mesh.position.y = Math.sin(a)*h;
      c.mesh.position.x = Math.cos(a)*h;
      c.mesh.position.z = -400-Math.random()*400;
      c.mesh.rotation.z = a + Math.PI/2;
      let s = 1+Math.random()*2;
      c.mesh.scale.set(s,s,s);
      this.mesh.add(c.mesh);
    }
  }
}


export class AirPlane {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airPlane";

    // Create the cabin
    var geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
    var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:THREE.FlatShading});
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Create Engine
    var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
    var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, flatShading:THREE.FlatShading});
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Create Tailplane

    var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
    var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:THREE.FlatShading});
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35,25,0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Create Wing

    var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
    var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:THREE.FlatShading});
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0,0,0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    // Propeller

    var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
    var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading:THREE.FlatShading});
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // Blades

    var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
    var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading:THREE.FlatShading});

    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8,0,0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    this.propeller.add(blade);
    this.propeller.position.set(50,0,0);
    this.mesh.add(this.propeller);
  }
};

const PlainThreeTest = () => {
  let scene,
    camera,
    planet,
    sky,
    airplane,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    renderer,
    container,
    frameId;
  let ambientLight, hemisphereLight, shadowLight;
  let HEIGHT = window.innerHeight, WIDTH = window.innerWidth,
    mousePos = { x: 0, y: 0 };

  const canvasRef = useRef(null);
  const [isAnimating, setAnimating] = useState(true);
  const controls = useRef(null);

  const createScene = () => {
    scene = new THREE.Scene();
    aspectRatio = WIDTH / HEIGHT;

    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );  
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 500;
    // createCamera()
   
    scene.fog = new THREE.Fog(Colors.summer, 100,950);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      WIDTH = canvasRef.current.clientWidth;
      HEIGHT = canvasRef.current.clientHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
      renderScene();
    };
    
    const loop = function () {

      stats.begin();
      updatePlane();
      planet.mesh.rotation.z += 0.003;
      sky.mesh.rotation.z += .003;
      renderScene();
      stats.end();
      window.requestAnimationFrame(loop);

    };

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = null;
    };

    canvasRef.current.appendChild(renderer.domElement);
    window.addEventListener("resize", handleResize);
    start();
    controls.current = { start, stop };

  };

  const createLights = () => {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
  
    scene.add(hemisphereLight);
    scene.add(shadowLight);
  }

  const createPlanet = () => {
    planet = new Planet();
    planet.mesh.position.y = -200;
    scene.add(planet.mesh);
  };

  const createSky = () => {
    sky = new Sky();
    sky.mesh.position.y = -200;
    scene.add(sky.mesh);
  }

  const createPlane = () => {
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25,.25,.25);
    airplane.mesh.position.y = 500;
    scene.add(airplane.mesh);
  }

  const updatePlane = () => {
    // const targetY = normalize(mousePos.y,-.75,.75,25, 175);
    // const targetX = normalize(mousePos.x,-.75,.75,-100, 100);
    const targetY = normalize(mousePos.y, -.425, .555, 425, 550);
    const targetX = normalize(mousePos.x, -.425, .555, -100, 100);

    airplane.mesh.position.y = targetY;
    airplane.mesh.position.x = targetX;
    airplane.propeller.rotation.x += 0.3;
  }

  const normalize = (v,vmin,vmax,tmin, tmax) => {
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax-vmin;
    var pc = (nv-vmin)/dv;
    var dt = tmax-tmin;
    var tv = tmin + (pc*dt);
    return tv;
  }

  const handleMouseMove = (event)  => {
    var tx = -1 + (event.clientX / WIDTH)*2;
    var ty = 1 - (event.clientY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, false);
    createScene();
    createLights();

    createPlane();

    createPlanet()
    createSky()

    // loop()

    return () => {
      controls.current.stop();
      // window.removeEventListener("resize", handleResize);
      canvasRef.current.removeChild(renderer.domElement);
      // scene.remove(cube);
      // geometry.dispose();
      // material.dispose();
    };
  }, []);

  // useEffect(() => {
  //   if (isAnimating) {
  //     controls.current.start();
  //   } else {
  //     controls.current.stop();
  //   }
  // }, [isAnimating]);

  

  return (
    <>
      {/* <h1> Teste </h1> */}
      <div className="world" ref={canvasRef}></div>
    </>
  );
};

export default PlainThreeTest;
