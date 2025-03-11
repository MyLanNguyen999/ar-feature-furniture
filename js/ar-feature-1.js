// Get the canvas element
const canvas = document.getElementById("renderCanvas");
if (!canvas) {
  console.error("Canvas element not found!");
}

// Create BABYLON 3D engine, attach it to canvas
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);

  //* CAMERA *//
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  //* LIGHTING *//
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  // Add HDR environment texture
  const hdrTexture = await BABYLON.CubeTexture.CreateFromPrefilteredData(
    "https://playground.babylonjs.com/textures/environment.env",
    scene
  );
  scene.environmentTexture = hdrTexture;

  //* MESH *//
  await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "./meshes/",
    "sofa.glb",
    scene
  ).then((result) => {
    let sofaMesh = result.meshes[0];

    // Position and scale the sofa
    sofaMesh.position = new BABYLON.Vector3(0, 0, 0);
    sofaMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
  });

  //* ADD WebXR *//
  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
    },
    optionalFeatures: ["hit-test"],
  });

  //* HIT TEST *//
  const hitTest = await xr.baseExperience.featuresManager.enableFeature(
    BABYLON.WebXRHitTest,
    "latest"
  );

  // Create a marker
  const marker = BABYLON.MeshBuilder.CreateTorus(
    "marker",
    { diameter: 0.15, thickness: 0.05 },
    scene
  );
  marker.isVisible = false;
  marker.rotationQuaternion = new BABYLON.Quaternion();

  // Store the latest hit-test results
  let latestHitTestResults = null;

  // Add event listener for hit-test results
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

  return scene;
};

// Render the scene in loop
createScene().then((sceneToRender) => {
  engine.runRenderLoop(() => {
    sceneToRender.render();
  });
});

// Resize event
window.addEventListener("resize", () => {
  engine.resize();
});
