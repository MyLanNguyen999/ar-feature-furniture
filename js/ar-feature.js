// Source: https://sketchfab.com/3d-models/sofa-80edec2de8c04a4fb335a48b550a2336
// Get the canvas element
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// ---------------------------------------------
// @ START OF SOFA
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

  //// ensure all meshes are pickable
  // result.meshes.forEach((mesh) => {
  //   mesh.isPickable = true;
  // });

  // Select the correct mesh
  sofaMesh =
    result.meshes.find((mesh) => mesh.name !== "__root__") || result.meshes[0];

  //! Create a material for the sofa
  const sofaMat = new BABYLON.StandardMaterial("sofaMat", scene);
  sofaMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Initial color
  // !

  // !
  // Apply material, pickable property, and action manager to all child meshes
  sofaMesh.getChildMeshes().forEach((mesh) => {
    mesh.isPickable = true;
    mesh.material = sofaMat;
    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        function () {
          // Generate random RGB values
          const randomColor = new BABYLON.Color3(
            Math.random(),
            Math.random(),
            Math.random()
          );
          sofaMat.diffuseColor = randomColor;
        }
      )
    );
  });
  // !
  // !
  // Set position, scaling, and rotation
  sofaMesh.position = new BABYLON.Vector3(0, 0, 0);
  sofaMesh.scaling = new BABYLON.Vector3(1, 1, 1);
  sofaMesh.rotation.y = Math.PI;

  // Add drag behaviors to the parent mesh
  const dragBehavior = new BABYLON.PointerDragBehavior({
    dragPlaneNormal: new BABYLON.Vector3(0, 1, 0), // Constrain to XZ plane
  });
  sofaMesh.addBehavior(dragBehavior);
  const sixDofDrag = new BABYLON.SixDofDragBehavior();
  sofaMesh.addBehavior(sixDofDrag);
}
// !

  // // Ensure the sofa is visible and pickable
  // // sofaMesh.isPickable = true;
  // sofaMesh.position = new BABYLON.Vector3(0, 0, 0);
  // sofaMesh.scaling = new BABYLON.Vector3(1, 1, 1);
  // sofaMesh.rotation.y = Math.PI;
  // // sofaMesh.scaling.z = -1;

  // @ END OF SOFA
  // ---------------------------------------------

  // // ! test drag
  // result.meshes.forEach((mesh) => {
  //   if (mesh instanceof BABYLON.Mesh) {
  //     let dragBehavior = new BABYLON.PointerDragBehavior({
  //       dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
  //     });
  //     mesh.addBehavior(dragBehavior);

  //     let sixDofDrag = new BABYLON.SixDofDragBehavior();
  //     mesh.addBehavior(sixDofDrag);
  //   }
  // });
  // console.log(`Loaded: $(sofaFile)`);

  // // ! end test
// }

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

  // ---------------------------------------------
  // @ START OF TABLE BOX
  // add a mesh table box
  const table = BABYLON.MeshBuilder.CreateBox("table", { size: 0.5 }, scene);

  const tableMat = new BABYLON.StandardMaterial("tableMat");
  tableMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  table.material = tableMat;
  table.position.x = 0;
  table.position.y = 0;
  table.position.z = 1;

  // add drag action to table
  table.addBehavior(new BABYLON.SixDofDragBehavior());

  // add a click event to change the color of the table randomly
  table.actionManager = new BABYLON.ActionManager(scene);
  table.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      function () {
        // generate random RGB values
        const randomColor = new BABYLON.Color3(
          Math.random(),
          Math.random(),
          Math.random()
        );
        tableMat.diffuseColor = randomColor;
      }
    )
  );
  // @ END OF TABLE BOX
  // ---------------------------------------------

  // ---------------------------------------------
  // @ START OF ACCENT CHAIR
  // @ add the chair with drag behavior
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./meshes/",
    "chair-1.glb",
    scene,
    function (meshes) {
      let chairMesh = meshes[0];

      chairMesh.position.x = 0;
      chairMesh.position.y = -0.2;
      chairMesh.position.z = 2;
      chairMesh.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);

      // create material for chair
      const chairMat = new BABYLON.StandardMaterial("chairMat", scene);
      chairMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // initial color

      // apply material and action manager to all child meshes
      chairMesh.getChildMeshes().forEach((mesh) => {
        mesh.material = chairMat;
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            function () {
              // generate random RGB values
              const randomColor = new BABYLON.Color3(
                Math.random(),
                Math.random(),
                Math.random()
              );
              chairMat.diffuseColor = randomColor;
            }
          )
        );
      });

      // add drag behavior to chair
      let dragBehavior = new BABYLON.PointerDragBehavior({
        dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
      });
      chairMesh.addBehavior(dragBehavior);
      let sixDofDrag = new BABYLON.SixDofDragBehavior();
      chairMesh.addBehavior(sixDofDrag);

      
    }
  );
  // @ END OF ACCENT CHAIR
  // ---------------------------------------------

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






