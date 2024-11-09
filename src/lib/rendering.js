import * as THREE from 'three';
import { db } from "./db";

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
            const fileName = model.textures[key].fileName;
            let [modId, subPath] = fileName.split(":");
            if (subPath == undefined) {
              subPath = modId;
              modId = "base";
            }

            // if (current_loader.name === "V1") {
            //     fileName = "textures/blocks/" + fileName;
            // }

            return {
                modId, subPath
            };
        };
    }
    if (model.parent) {
        return resolveTexture(current_models[model.parent], side);
    }
    return null;
}

async function originatesFrom(model, origins) {
    if (origins.includes(model.parent)) {
        return true;
    } else if (model.parent) {
        const [modId, subPath] = model.parent.split(":");
        return await originatesFrom((await db.models.where({ modId, subPath }).first()).data, origins);
    }
    return false;
}

let renderingCache = null;

function getRenderingCache() {
    if (renderingCache) return renderingCache;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const geometry = new THREE.BoxGeometry(1.25, 1.25, 1.25);
    const loader = new THREE.TextureLoader();
    camera.position.x = 2;
    camera.position.y = 2;
    camera.position.z = 2;
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderingCache = {
        scene,
        camera,
        renderer,
        geometry,
        loader
    }

    return renderingCache;
}

export async function renderBlockModel(modelName) {
    // I hope .last means the last added, because then I wont need to implement "search for overrides" stuff
    const [modId, subPath] = modelName.split(":");
    // const renderedModel = await db.renderedModels.where({ modId, subPath }).first();
    // if (renderedModel?.data) return renderedModel.data;

    const model = (await db.models.where({ modId, subPath }).first())?.data;
    if (!model) return null;
    if (await originatesFrom(model, ["base:models/blocks/cube.json", "base:models/blocks/cube_no_ao.json", "cube", "cube_no_ao"])) {
        const top = await db.textures.where(resolveTexture(model, "top")).first();
        const bottom = await db.textures.where(resolveTexture(model, "bottom")).first();
        const front = await db.textures.where(resolveTexture(model, "front")).first();
        const back = await db.textures.where(resolveTexture(model, "back")).first();
        const right = await db.textures.where(resolveTexture(model, "right")).first();
        const left = await db.textures.where(resolveTexture(model, "left")).first();
        const { scene, camera, renderer, geometry, loader } = getRenderingCache();

        const textures = [
            right,
            back,
            top,
            bottom,
            front,
            left,
        ];

        const loadedTextures = await Promise.all(textures.map(textureRow => new Promise((resolve) => {
            let texture;
            if (!textureRow?.data) {
                resolve(null);
            }
            texture = loader.load(textureRow.data, () => resolve(texture));
        })))
        const materials = loadedTextures.map(texture => new THREE.MeshBasicMaterial({ map: texture })).map((material) => {
            material.map.minFilter = THREE.NearestFilter;
            material.map.magFilter = THREE.NearestFilter;
            material.transparent = true;
            return material;
        });

        const cube = new THREE.Mesh(geometry, materials);

        scene.add(cube);
        camera.lookAt(cube.position);
        renderer.render(scene, camera);
        scene.remove(cube);

        return new Promise((resolve, reject) => {
            renderer.domElement.toBlob((blob) => {
                // db.renderedModel.put({modId, subPath, data: dataUri})
                resolve(URL.createObjectURL(blob));
            })
            materials.forEach((material) => {
                material.dispose();
            });
        });
    }
    else if (originatesFrom(model, ["base:models/blocks/empty.json", "empty"])) {
        return "https://placehold.co/64/0000/0000";
    } else {
        return null;
    }
}