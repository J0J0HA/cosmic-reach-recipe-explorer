import * as THREE from 'three';
import { models, textures, loader } from "./stores";

let current_models = {};
let current_textures = {};
let current_loader;

models.subscribe((value) => {
    current_models = value;
})
textures.subscribe((value) => {
    current_textures = value;
})
loader.subscribe((value) => {
    current_loader = value;
})

const textureMapping = {
    front: ["side", "all"],
    back: ["side", "all"],
    left: ["side", "all"],
    right: ["side", "all"],
    top: ["top", "all"],
    bottom: ["bottom", "all"]
}

function resolveTexture(model, side) {
    for (let key of textureMapping[side]) {
        if (model.textures[key]) {
            let fileName = model.textures[key].fileName;

            if (current_loader.name === "V1") {
                fileName = "textures/blocks/" + fileName;
            }

            return fileName;
        };
    }
    if (model.parent) {
        return resolveTexture(current_models[model.parent], side);
    }
    return null;
}

function isCube(model) {
    if (model.parent === "base:models/blocks/cube.json" || model.parent === "base:models/blocks/cube_no_ao.json" || model.parent === "cube" || model.parent === "cube_no_ao") {
        return true;
    } else if (model.parent) {
        return isCube(current_models[model.parent]);
    }
    return false;
}

export async function renderBlockModel(modelName) {
    const model = current_models[modelName];
    if (!model) return null;
    if (isCube(model)) {
        const top = current_textures[resolveTexture(model, "top")];
        const bottom = current_textures[resolveTexture(model, "bottom")];
        const front = current_textures[resolveTexture(model, "front")];
        const back = current_textures[resolveTexture(model, "back")];
        const right = current_textures[resolveTexture(model, "right")];
        const left = current_textures[resolveTexture(model, "left")];

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100);

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const geometry = new THREE.BoxGeometry(1.25, 1.25, 1.25);

        const loader = new THREE.TextureLoader();
        const textures = [
            right,
            back,
            top,
            bottom,
            front,
            left,
        ];

        const loadedTextures = await Promise.all(textures.map(blob => new Promise((resolve) => {
            let texture;
            if (!blob) {
                resolve(null);
            }
            texture = loader.load(URL.createObjectURL(blob), () => resolve(texture));
        })))
        const materials = loadedTextures.map(texture => new THREE.MeshBasicMaterial({ map: texture })).map((material) => {
            material.map.minFilter = THREE.NearestFilter;
            material.map.magFilter = THREE.NearestFilter;
            material.transparent = true;
            return material;
        });

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