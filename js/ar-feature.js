// get the canvas element
const canvas = document.getElementById('renderCanvas');

// create BABYLON 3D engine, attach it to canvas
const engine = new BABYLON.Engine(canvas, true);

// generate createScene function
const createScene = function () {
    // create a new BABYLON scene, passing in the engine as an argument
    const scene = new BABYLON.Scene(engine);

    //* CAMERA *//
    // add camera to the canvas
    const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3(0,0,0));
    // attach camera to the scene
    camera.attachControl(canvas, true);

    // * LIGHTING *//
    // add light to the scene
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // * MESH *//
    // add a 3D model of a sofa using ImportMeshAsync method
    // source: https://sketchfab.com/3d-models/sofa-80edec2de8c04a4fb335a48b550a2336
    const sofa = BABYLON.sceneLoader.ImportMeshAsync('', './meshes/', 'sofa.glb', scene).then((result) => {
        let sofaMesh = result.meshes[0];

        // position the sofa
        sofaMesh.position = new BABYLON.Vector3(0, 0, 0);

        // scale the sofa
        sofaMesh.scaling = new BABYLON.Vector3(10, 10, 10);

    });

    // * RETURN SCENE *//
    return scene;
};

// Render the scene in loop
createScene().then((sceneToREnder) => {
    engine.runRenderLoop(() => {
        sceneToREnder.render();
    });
});

// add even listener that adapts to the user resizing the window
window.addEventListener('resize', () => {
    engine.resize();
});