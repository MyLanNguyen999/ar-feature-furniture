// Modified version with color change and reliable dragging
async function loadSofa(scene) {
  if (sofaMesh) {
    sofaMesh.dispose();
  }

  currentSofaIndex = (currentSofaIndex + 1) % sofaModels.length;
  const sofaFile = sofaModels[currentSofaIndex];

  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "./meshes/",
    sofaFile,
    scene
  );

  sofaMesh =
    result.meshes.find((mesh) => mesh.name !== "__root__") || result.meshes[0];

  // Basic mesh setup
  sofaMesh.isPickable = true;
  sofaMesh.position = new BABYLON.Vector3(0, 1, 0);
  sofaMesh.scaling = new BABYLON.Vector3(1, 1, 1);
  sofaMesh.rotation.y = Math.PI;
  sofaMesh.scaling.z = -1;

  // Ensure material exists for color changes
  if (!sofaMesh.material) {
    sofaMesh.material = new BABYLON.StandardMaterial("sofaMat", scene);
  }

  // Add drag behavior (SixDof for full freedom)
  const dragBehavior = new BABYLON.SixDofDragBehavior();
  dragBehavior.dragDeltaRatio = 1; // Adjust sensitivity if needed
  dragBehavior.zDragFactor = 1; // Ensure Z-axis dragging works
  sofaMesh.addBehavior(dragBehavior);
}

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.1, 1);

  // Camera and lighting setup (unchanged)
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  const hdrTexture = await BABYLON.CubeTexture.CreateFromPrefilteredData(
    "https://playground.babylonjs.com/textures/environment.env",
    scene
  );
  scene.environmentTexture = hdrTexture;

  // Load initial sofa
  await loadSofa(scene);

  // Click handler for color change and model switching
  scene.onPointerDown = function (evt, pickResult) {
    if (pickResult.hit && pickResult.pickedMesh === sofaMesh) {
      // Change color randomly
      if (sofaMesh.material) {
        sofaMesh.material.diffuseColor = new BABYLON.Color3(
          Math.random(), // Red
          Math.random(), // Green
          Math.random() // Blue
        );
      }

      // Optional: Uncomment to also cycle models on click
      // loadSofa(scene);
    }
  };

  // XR setup (unchanged)
  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor",
    },
    optionalFeatures: true,
  });

  return scene;
};

// Render loop and resize handler (unchanged)
createScene().then((sceneToRender) => {
  engine.runRenderLoop(() => {
    sceneToRender.render();
  });
});

window.addEventListener("resize", () => {
  engine.resize();
});
