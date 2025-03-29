// Source: https://sketchfab.com/3d-models/sofa-80edec2de8c04a4fb335a48b550a2336
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


  // console.log(`🔄 Loading: ${sofaFile}`);

  // Load the new sofa
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "./meshes/",
    sofaFile,
    scene
  );

  
  // Select the correct mesh
  sofaMesh =
    result.meshes.find((mesh) => mesh.name !== "__root__") || result.meshes[0];

  // Ensure the sofa is visible and pickable
  sofaMesh.isPickable = true;
  sofaMesh.position = new BABYLON.Vector3(0, 0, 0);
  sofaMesh.scaling = new BABYLON.Vector3(1, 1, 1);
  sofaMesh.rotation.y = Math.PI;
  // sofaMesh.scaling.z = -1;

  
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

  // testing a mesh table box
  const table = BABYLON.MeshBuilder.CreateBox("table", { size: 0.5 }, scene);

  const tableMat = new BABYLON.StandardMaterial("tableMat");
  tableMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  table.material = tableMat;
  table.position.x = 0;
  table.position.y = 0;
  table.position.z = 1;

  // add drag action to table
  table.addBehavior(new BABYLON.SixDofDragBehavior());

  // !test create a chair
  const chair = BABYLON.SceneLoader.ImportMeshAsync("", "./meshes/", "chair-1.glb").then((result) => { 
    const chairMesh = result.meshes[0];
    chairMesh.position.x = 0;
    chairMesh.position.y = 0;
    chairMesh.position.z = -2;
    chairMesh.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    chairMesh.rotation.x = BABYLON.Tools.ToRadians(180);

  });

  // add drab action to chair
  chairMesh.addBehavior(new BABYLON.SixDofDragBehavior());

  // ! end of test chair

  // 🔥 Click listener for mesh picking - FOR DEBUGGING
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

  //   Enable AR
  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor", //viewer, local, local-floor, bounded-floor, or unbounded
    },
    optionalFeatures: true,
  });

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


















