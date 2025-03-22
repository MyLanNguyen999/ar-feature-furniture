// Get the canvas element
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Sofa models array for cycling through them
const sofaModels = ["sofa.glb", "sofa-1.glb", "sofa-2.glb"];
let currentSofaIndex = -1; // Start at -1 so the first sofa is correctly loaded
let sofaMesh = null;

async function loadSofa(scene) {
  // Remove previous sofa if exists
  if (sofaMesh) {
    console.log("Disposing old sofa...");
    sofaMesh.dispose();
  }

  // Update index for looping models
  currentSofaIndex = (currentSofaIndex + 1) % sofaModels.length;
  const sofaFile = sofaModels[currentSofaIndex];

  console.log(`🔄 Loading: ${sofaFile}`);

  // Load the new sofa
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "./meshes/",
    sofaFile,
    scene
  );

  // Select the correct mesh (some .glb files have a root empty node)
  sofaMesh =
    result.meshes.find((mesh) => mesh.name !== "__root__") || result.meshes[0];

  // Ensure the sofa is visible and pickable
  sofaMesh.isPickable = true;
  sofaMesh.position = new BABYLON.Vector3(0, 1, 0);
  sofaMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
  sofaMesh.rotation.y = Math.PI;
  sofaMesh.scaling.z = -1;

  console.log("✅ Sofa loaded and ready to be clicked!");
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

  // HDR Environment
  const hdrTexture = await BABYLON.CubeTexture.CreateFromPrefilteredData(
    "https://playground.babylonjs.com/textures/environment.env",
    scene
  );
  scene.environmentTexture = hdrTexture;

  // Load the first sofa
  await loadSofa(scene);

  // 🔥 Click listener for mesh picking
  scene.onPointerDown = function (evt, pickResult) {
    console.log("🖱 Click detected!");
    if (pickResult.hit) {
      console.log("✅ Object clicked:", pickResult.pickedMesh.name);
      if (pickResult.pickedMesh === sofaMesh) {
        console.log("🔄 Changing sofa...");
        loadSofa(scene);
      }
    } else {
      console.log("❌ No object clicked.");
    }
  };

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

