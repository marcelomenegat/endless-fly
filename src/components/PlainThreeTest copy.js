import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import '../App.css';
// https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
// https://github.com/yakudoo/TheAviator
// https://codesandbox.io/s/modest-dijkstra-upurqm?file=/js/main_step1.js:6242-6338
// https://jasonweaver.name/three-js-and-react-with-react-three-fiber/
/** Sea = () => {
    var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var mat = new THREE.MeshPhongMaterial({
      color: Colors.blue,
      transparent: true,
      opacity: 0.6,
      shading: THREE.FlatShading
    });
    //this.mesh = new THREE.Mesh(geom, mat);
    ///this.mesh.receiveShadow = true;
  };
  */

import * as dat from "https://cdn.skypack.dev/dat.gui"
const gui = new dat.GUI()

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
    // var geom = new THREE.CylinderGeometry(2, 2, 2);
    // geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // var mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // // var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    // // geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // // var mat = new THREE.MeshPhongMaterial({
    // //   color: Colors.blue,
    // //   transparent: false,
    // //   opacity: 0.6,
    // //   flatShading: THREE.FlatShading
    // // });
    // this.mesh = new THREE.Mesh(geom, mat);
    // this.mesh.receiveShadow = true;

    let geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10 );
    // var geometry = new THREE.CylinderGeometry(400, 400, 250, 80, 60 ); // #NOTE: Nao precisa usar o planet.mesh.position.y = -200 :> animate()
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let material = new THREE.MeshPhongMaterial({
      color: Colors.blue,
      transparent: true,
      opacity: 0.6,
      flatShading : THREE.FlatShading
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;

    // let cilinder = new THREE.Mesh(geometry, material);
    // cilinder.receiveShadow = true;
    // scene.add(cilinder);    
    
  }
}

const PlainThreeTest = () => {
  let scene,
    camera,
    planet,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    renderer,
    container,
    frameId;

  let ambientLight, hemisphereLight, shadowLight;


  let HEIGHT = window.innerHeight,
    WIDTH = window.innerWidth;

  const canvasRef = useRef(null);
  const [isAnimating, setAnimating] = useState(true);
  const controls = useRef(null);

  const createScene = () => {
    scene = new THREE.Scene();
    aspectRatio = WIDTH / HEIGHT;
    // console.log(`${HEIGHT} / ${WIDTH}`);
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    // scene.fog = new THREE.Fog(Colors.summer, 200, 410);
    scene.fog = new THREE.Fog(Colors.summer, 100,950);
     
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 500;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    new OrbitControls(camera, renderer.domElement)
    // camera.position.z = 150
    // 600, 600, 800, 40, 10
    // CylinderGeometry(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number, heightSegments?: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number): THREE.CylinderGeometry
    // var geometry = new THREE.CylinderGeometry(400, 400, 250, 80, 60 );
    // geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var material = new THREE.MeshPhongMaterial({
    //   color: Colors.blue,
    //   transparent: true,
    //   opacity: 0.6,
    //   flatShading : THREE.FlatShading
    // });

    // var cilinder = new THREE.Mesh(geometry, material);
    // cilinder.receiveShadow = true;
    // scene.add(cilinder);

    createPlanet()


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

    var animate = function () {
      planet.mesh.rotation.z += 0.002;
      renderScene();
      window.requestAnimationFrame(animate);
      // renderer.render(scene, camera);
    };

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate);
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

    //window.addEventListener("resize", handleWindowResize, false);
    // return () => canvasRef.current.removeChild(renderer.domElement);
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

  useEffect(() => {
    createScene();
    createLights();

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
