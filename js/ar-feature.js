// get the canvas element
const canvas = document.getElementById("renderCanvas");

// create BABYLON 3D engine, attach it to canvas
const engine = new BABYLON.Engine(canvas, true);

// generate createScene function
const createScene = async function () {
    // create a new BABYLON scene, passing in the engine as an argument
    const scene = new BABYLON.Scene(engine);

    // change the color of the scene background
    scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.1, 1);

    //* CAMERA *//
    // add camera to the canvas
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        2,
        BABYLON.Vector3.Zero(),
        scene
    );

    // attach camera to the scene
    camera.attachControl(canvas, true);

    // * LIGHTING *//
    // add light to the scene
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;

    // Add an HDR environment texture for proper lighting
    const hdrTexture = await BABYLON.CubeTexture.CreateFromPrefilteredData("https://playground.babylonjs.com/textures/environment.env", scene);
    scene.environmentTexture = hdrTexture;

    // * MESH *//
    // add a 3D model of a sofa using ImportMeshAsync method
    // source: https://sketchfab.com/3d-models/sofa-80edec2de8c04a4fb335a48b550a2336
    // source: https://sketchfab.com/3d-models/grey-sofa-e94e15859aff4c5ebf4791c46ab8ba42
    const sofa = BABYLON.SceneLoader.ImportMeshAsync("", "./meshes/", "sofa.glb", scene)
        .then((result) => {
            let sofaMesh = result.meshes[0];

            //position the sofa
            sofaMesh.position = new BABYLON.Vector3(0, 100, 0);

            // scale the sofa
            sofaMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);

            //* ROTATION *//
            sofaMesh.rotation.y = Math.PI;
            sofaMesh.scaling.z = -1;
        });

    // * ADD WebXR *//
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
        },
        optionalFeatures: ["hit-test", "anchor"],
    });

    // * HIT TEST *//

    const hitTest = await xr.baseExperience.featuresManager.enableFeature(
        BABYLON.WebXRHitTest,
        "latest"
    );

    // Create a marker to show where a hit-test has registered a surface
    const marker = BABYLON.MeshBuilder.CreateTorus(
        "marker",
        { diameter: 0.15, thickness: 0.05 },
        scene
    );
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();

    // Create a variable to store the latest hit-test results
    let latestHitTestResults = null;

    // Add an event listener for the hit-test results
    hitTest.onHitTestResultObservable.add((results) => {
        // If there is a hit-test result, turn on the marker, and extract the position, rotation, and scaling from the hit-test result
        if (results.length) {
            marker.isVisible = true;
            results[0].transformationMatrix.decompose(
                marker.scaling,
                marker.rotationQuaternion,
                marker.position
            );
            latestHitTestResults = results;
        } else {
            // If there is no hit-test result, turn off the marker and clear the stored results
            marker.isVisible = false;
            latestHitTestResults = null;
        };
    });

    // * ANCHOR *//
    const anchors = xr.baseExperience.featuresManager.enableFeature(
        BABYLON.WebXRAnchorSystem,
        "latest"
    );
    //Add event listener for click (and simulate this in the Immersive Web Emulator)
    canvas.addEventListener("click", () => {
        if (latestHitTestResults && latestHitTestResults.length > 0) {
            // Create an anchor
            anchors
                .addAnchorPointUsingHitTestResultAsync(latestHitTestResults[0])
                .then((anchor) => {
                    // Attach sofa to anchor
                    anchor.attachedNode = sofa;
                })
                .catch((error) => {
                    console.log(error);
                });
        };
    });

    // * RETURN SCENE *//
    return scene;
};

// * RENDER SCENE *//
// Render the scene in loop
createScene().then((sceneToREnder) => {
    engine.runRenderLoop(() => {
        sceneToREnder.render();
    });
});

// * RESIZE *//
// add even listener that adapts to the user resizing the window
window.addEventListener("resize", () => {
    engine.resize();
});




