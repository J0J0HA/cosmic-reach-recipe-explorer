import * as THREE from 'three';
import { models, textures } from "./stores";

let current_models = {};
let current_textures = {};

models.subscribe((value) => {
    current_models = value;
})
textures.subscribe((value) => {
    current_textures = value;
})

const textureMapping = {
    front: ["side", "all"],
    back: ["side", "all"],
    left: ["side", "all"],
    right: ["side", "all"],
    top: ["top", "all"],
    bottom: ["bottom", "all"]
}

function getTexture(texture) {
    return current_textures["textures/blocks/" + texture]
}

function resolveTexture(scope, model, side) {
    for (let key of textureMapping[side]) {
        if (model.textures[key]) return model.textures[key].fileName;
    }
    if (model.parent) {
        return resolveTexture(scope, current_models[scope + "/" + model.parent + ".json"], side);
    }
    return null;
}

function isCube(scope, model) {
    console.log(scope, model)
    if (model.parent === "cube" || model.parent === "cube_no_ao") {
        return true;
    } else if (model.parent) {
        return isCube(scope, current_models[scope + "/" + model.parent + ".json"]);
    }
    return false;
}

export async function renderModel(scope, modelName) {
    const model = current_models[scope + "/" + modelName + ".json"];
    if (!model) return null;
    if (isCube(scope, model)) {
        const top = getTexture(resolveTexture(scope, model, "top"));
        const bottom = getTexture(resolveTexture(scope, model, "bottom"));
        const front = getTexture(resolveTexture(scope, model, "front"));
        const back = getTexture(resolveTexture(scope, model, "back"));
        const right = getTexture(resolveTexture(scope, model, "right"));
        const left = getTexture(resolveTexture(scope, model, "left"));

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100);

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const geometry = new THREE.BoxGeometry(1.25, 1.25, 1.25);

        const loader = new THREE.TextureLoader();
        const textures = [
            top,
            bottom,
            right,
            left,
            front,
            back,
        ];

        const loadedTextures = await Promise.all(textures.map(blob => new Promise((resolve) => {
            let texture;
            texture = loader.load(URL.createObjectURL(blob), () => resolve(texture));
        })))
        const materials = loadedTextures.map(texture => new THREE.MeshBasicMaterial({ map: texture }));

        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        camera.position.x = 2;
        camera.position.y = 2;
        camera.position.z = 2;
        camera.lookAt(cube.position);

        renderer.render(scene, camera);

        return new Promise((resolve, reject) => {
            renderer.domElement.toBlob((blob) => {
                resolve(blob);
            })

            renderer.dispose();
            materials.forEach((material) => {
                material.dispose();
            });
            geometry.dispose();
        });
    }
}