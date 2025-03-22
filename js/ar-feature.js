// Get the canvas element
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Sofa model list and index tracker
const sofaModels = ["sofa.glb", "sofa-1.glb", "sofa-2.glb"];
let currentSofaIndex = 0;
let sofaMesh;

async function loadSofa(scene) {
  if (sofaMesh) {
    sofaMesh.dispose();
  }

  currentSofaIndex = (currentSofaIndex + 1) % sofaModels.length;
  let sofaFile = sofaModels[currentSofaIndex];
  console.log(`Loading: ${sofaFile}`);

  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "./meshes/",
    sofaFile,
    scene
  );
  sofaMesh = result.meshes[0];

  sofaMesh.position = new BABYLON.Vector3(0, 1, 0);
  sofaMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
  sofaMesh.rotation.y = Math.PI;
  sofaMesh.scaling.z = -1;

  // ✅ Ensure the action manager is set on the scene
  if (!scene.actionManager) {
    scene.actionManager = new BABYLON.ActionManager(scene);
  }

  // ✅ Use scene.onPointerDown to detect clicks
  scene.onPointerDown = function (evt, pickResult) {
    if (pickResult.hit && pickResult.pickedMesh === sofaMesh) {
      loadSofa(scene);
    }
  };
}

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.1, 1);

  // CAMERA
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // LIGHTING
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  // HDR Texture
  const hdrTexture = await BABYLON.CubeTexture.CreateFromPrefilteredData(
    "https://playground.babylonjs.com/textures/environment.env",
    scene
  );
  scene.environmentTexture = hdrTexture;

  // Load the first sofa
  await loadSofa(scene);

  return scene;
};

// RENDER LOOP
createScene().then((sceneToRender) => {
  engine.runRenderLoop(() => {
    sceneToRender.render();
  });
});

// RESIZE HANDLER
window.addEventListener("resize", () => {
  engine.resize();
});

