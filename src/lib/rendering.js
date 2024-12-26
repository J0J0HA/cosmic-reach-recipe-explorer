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


async function mergeModel(model) {
    const a = model;
    let b = {};
    if (model.parent) {
        b = await mergeModel((await db.models.where({ modId: model.parent.split(":")[0], subPath: model.parent.split(":")[1] }).first()).data)
    }

    return {
        textures: {
            ...(b.textures || {}),
            ...(a.textures || {}),
        },
        cuboids: a.cuboids || b.cuboids || [],
    }

}

function geoOfDir(dir, bounds) {
    const [minX, minY, minZ, maxX, maxY, maxZ] = bounds;
    const [midX, midY, midZ] = [(maxX - minX) / 2, (maxY - minY) / 2, (maxZ - minZ) / 2]
    switch (dir) {
        case "localNegX":
            return [-midX, 0, 0];
        case "localPosX":
            return [midX, 0, 0];
        case "localNegY":
            return [0, -midY, 0];
        case "localPosY":
            return [0, midY, 0];
        case "localNegZ":
            return [0, 0, -midZ];
        case "localPosZ":
            return [0, 0, midZ];
    }
    console.error("Huh?")
    throw new Error("Huh?")
}

function rotOfDir(dir) {
    const d90 = THREE.MathUtils.degToRad(90);
    switch (dir) {
        case "localNegX":
            return new THREE.Euler(0, d90, 0);
        case "localPosX":
            return new THREE.Euler(0, d90, 0);
        case "localNegY":
            return new THREE.Euler(d90, 0, 0);
        case "localPosY":
            return new THREE.Euler(d90, 0, 0);
        case "localNegZ":
            return new THREE.Euler(0, 0, 0);
        case "localPosZ":
            return new THREE.Euler(0, 0, 0);
    }
    console.error("Huh?")
    throw new Error("Huh?")
}

export async function renderBlockModel(modelName) {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-14, 14, 14, -14, 1, 1000);
    // const camera = new THREE.PerspectiveCamera(40, 1, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const loader = new THREE.TextureLoader();

    const [modId, subPath] = modelName.split(":");
    const model = (await db.models.where({ modId, subPath }).first())?.data;

    if (!model) return null;
    const merged = await mergeModel(model);

    // textures & materials
    const textureSide = (merged.textures.side || merged.textures.all)?.fileName;
    const textureTop = (merged.textures.top || merged.textures.all)?.fileName;
    const textureBottom = (merged.textures.bottom || merged.textures.all)?.fileName;

    const uniquePaths = new Set([textureBottom, textureSide, textureTop]);

    const fetchedTextures = {};

    for (let path of uniquePaths) {
        if (path == undefined) continue;
        const [modId, subPath] = path.split(":");
        const file = await db.textures.where({ modId, subPath }).first();
        fetchedTextures[path] = file;
    }

    const loadedTextures = await Promise.all(Object.entries(fetchedTextures).map(([path, textureRow]) => new Promise((resolve, reject) => {
        let texture;
        if (!textureRow?.data) {
            resolve([path, null]);
        }
        texture = loader.load(textureRow.data, () => resolve([path, texture]), () => { }, reject);
    })))

    const materials = Object.fromEntries(loadedTextures.map(([path, texture]) => [path, new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })]).map(([path, material]) => {
        material.map.minFilter = THREE.NearestFilter;
        material.map.magFilter = THREE.NearestFilter;
        material.transparent = true;
        return [path, material];
    }));

    const materialFor = {
        side: materials[textureSide],
        top: materials[textureTop],
        bottom: materials[textureBottom],
    }

    // faces


    for (let cube of merged.cuboids) {
        for (let [direction, face] of Object.entries(cube.faces)) {
            const faceGeo = new THREE.PlaneGeometry(face.uv[2] - face.uv[0], face.uv[3] - face.uv[1]);
            const [rotX, rotY, rotZ] = rotOfDir(direction)
            faceGeo.rotateX(rotX);
            faceGeo.rotateY(rotY);
            faceGeo.rotateZ(rotZ);
            const faceMat = materialFor[face.texture];
            const faceMesh = new THREE.Mesh(faceGeo, faceMat);
            faceMesh.position.set(...geoOfDir(direction, cube.localBounds));
            scene.add(faceMesh);
        }
    }

    camera.position.set(16, 16, 16)
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    return new Promise((resolve, reject) => {
        renderer.domElement.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
        })
    });
}


export async function renderBlockModelOld(modelName) {
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