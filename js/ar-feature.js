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

  // Add click action to change the sofa
  sofaMesh.actionManager = new BABYLON.ActionManager(scene);
  sofaMesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      loadSofa(scene);
    })
  );
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

  // WebXR Setup
  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor",
    },
    optionalFeatures: ["hit-test", "anchor"],
  });

  if (!xr.baseExperience) {
    console.error("WebXR base experience failed to initialize.");
    return scene;
  }

  // HIT TEST
  const hitTest = await xr.baseExperience.featuresManager.enableFeature(
    BABYLON.WebXRHitTest,
    "latest"
  );

  const marker = BABYLON.MeshBuilder.CreateTorus(
    "marker",
    { diameter: 0.15, thickness: 0.05 },
    scene
  );
  marker.isVisible = false;
  marker.rotationQuaternion = new BABYLON.Quaternion();

  let latestHitTestResults = null;

  hitTest.onHitTestResultObservable.add((results) => {
    if (results.length) {
      marker.isVisible = true;
      results[0].transformationMatrix.decompose(
        marker.scaling,
        marker.rotationQuaternion,
        marker.position
      );
      latestHitTestResults = results;
    } else {
      marker.isVisible = false;
      latestHitTestResults = null;
    }
  });

  // ANCHOR SYSTEM
  const anchors = xr.baseExperience.featuresManager.enableFeature(
    BABYLON.WebXRAnchorSystem,
    "latest"
  );

  canvas.addEventListener("click", () => {
    if (latestHitTestResults && latestHitTestResults.length > 0) {
      anchors
        .addAnchorPointUsingHitTestResultAsync(latestHitTestResults[0])
        .then((anchor) => {
          if (sofaMesh) {
            anchor.attachedNode = sofaMesh;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
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

