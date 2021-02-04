import {OrbitControls} from './orbitControls.js'
import {GLTFLoader} from './GLTFLoader.js'


//setup scene
var scene = new THREE.Scene();
//scene.background = new THREE.Color(0x0c0a44);
//scene.background = new THREE.Color(0xffffff);

//setup camera
var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    1,
    2000
);

//render
var renderer = new THREE.WebGLRenderer();
scene.fog = new THREE.FogExp2(0x11111f, 0.002);
renderer.setClearColor(scene.fog.color);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//orbitControls
var controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 10;

controls.enableDamping = true;
controls.dampingFactor = 0.5;

//eventos de resize de la ventana del navegador
window.addEventListener('resize', redimensionar);

function redimensionar(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

//ambient light
var ambientLight = new THREE.AmbientLight(0x555555,50);
scene.add(ambientLight)

//directional light of the rain
var directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0,0,1);
scene.add(directionalLight);


//modelo GLTF
var loader = new GLTFLoader();
const url = '3d/scene.gltf';
loader.load(url, (gltf) => {
    const root = gltf.scene;
    scene.add(root);
});


//nubes textura
var cloudParticles = [];
var loaderCloud = new THREE.TextureLoader();
loaderCloud.load("nube.png", function(texture){
    var cloudGeo = new THREE.PlaneBufferGeometry(500,500);
    var cloudMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true
    });
    for(let p=0; p<1; p++) {
        var cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
        cloud.position.set(
            Math.random()*800 -400,
            300,
            Math.random()*500 - 450
        );
        cloud.rotation.x = 1.5;
        cloud.rotation.y = -0.12;
        cloud.rotation.z = Math.random()*360;
        cloud.material.opacity = 0.4;
        cloudParticles.push(cloud);
        cloud.scale.set(10,10,1);
        scene.add(cloud);
    }
    animate();
});

//pointlight simulando los rayos
var flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
flash.position.set(200,300,100);
scene.add(flash);

//lluvia
var rainCount = 15000;
var rainGeo = new THREE.Geometry();
for(let i=0;i<rainCount;i++) {
    var rainDrop = new THREE.Vector3(
        Math.random() * 400 -200,
        Math.random() *  500 - 250,
        Math.random() * 400 - 200
    );
    rainDrop.velocity = {};
    rainDrop.velocity = 0;
    rainGeo.vertices.push(rainDrop);
}

var rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
  });

var rain = new THREE.Points(rainGeo,rainMaterial);
scene.add(rain);

//animation
var animate = function(){

    //nubes random
    cloudParticles.forEach(p => {
        p.rotation.z -=0.002;
    });

    //rayos en posiciones random
    if(Math.random() > 0.93 || flash.power > 100) {
        if(flash.power < 100){
            flash.position.set(
                Math.random()*400,
                300 + Math.random() *200,
                100
            )
        };
        flash.power = 50 + Math.random() * 500;
    };

    //lluvia velocidad
    rainGeo.vertices.forEach(p => {
        p.velocity -= 0.1 + Math.random() * 0.1;
        p.y += p.velocity;
        if (p.y < -200) {
            p.y = 200;
            p.velocity = 0;
        }
      });
    rainGeo.verticesNeedUpdate = true;
    rain.rotation.y +=0.002;

    //animacion del resto de la escena
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

camera.position.z = 5;
animate();



