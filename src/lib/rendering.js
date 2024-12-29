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

function getRenderingStuff() {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-14, 14, 14, -14, 1, 1000);
    // const camera = new THREE.PerspectiveCamera(40, 1, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const loader = new THREE.TextureLoader();

    return {
        scene,
        camera,
        renderer,
        loader,
    }
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
    const d180 = THREE.MathUtils.degToRad(180);
    switch (dir) {
        case "localNegX":
            return new THREE.Euler(0, d90, 0);
        case "localPosX":
            return new THREE.Euler(0, d90, 0);
        case "localNegY":
            return new THREE.Euler(-d90, d90, 0);
        case "localPosY":
            return new THREE.Euler(-d90, d90, 0);
        case "localNegZ":
            return new THREE.Euler(0, 0, 0);
        case "localPosZ":
            return new THREE.Euler(0, 0, 0);
    }
    console.error("Huh?")
    throw new Error("Huh?")
}

function colorOfDir(dir) {
    switch (dir) {
        case "localNegX":
            return 0x666666;
        case "localPosX":
            return 0xCCCCCC;
        case "localNegY":
            return 0x999999;
        case "localPosY":
            return 0xFFFFFF;
        case "localNegZ":
            return 0x444444;
        case "localPosZ":
            return 0xAAAAAA;
    }
    console.error("Huh?")
    throw new Error("Huh?")
}

export async function renderBlockModel(modelName, highQual = false) {
    const [modId, subPath] = modelName.split(":");
    if (!highQual) {
        const renderedModel = await db.renderedModels.where({ modId, subPath }).first();
        if (renderedModel?.data) return new Promise(resolve => resolve(renderedModel.data));
    }
    const model = (await db.models.where({ modId, subPath }).first())?.data;

    const { scene, camera, renderer, loader } = getRenderingStuff();

    // if (renderingCache) return renderingCache;

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

    const loadedTextures = Object.fromEntries(await Promise.all(Object.entries(fetchedTextures).map(([path, textureRow]) => new Promise((resolve, reject) => {
        let texture;
        if (!textureRow?.data) {
            resolve([path, null]);
        }
        texture = loader.load(textureRow.data, () => {
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            resolve([path, texture])
        }, () => { }, reject);
    }))));

    // const materials = Object.fromEntries(loadedTextures.map(([path, texture]) => [path, new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: texture, side: THREE.DoubleSide })]).map(([path, material]) => {
    //     material.color = 0xFFFFFF;
    //     material.map.minFilter = THREE.NearestFilter;
    //     material.map.magFilter = THREE.NearestFilter;
    //     material.transparent = true;
    //     return [path, material];
    // }));

    const makeMaterial = (texture, tint) => {
        const material = new THREE.MeshBasicMaterial({ color: tint, map: texture, side: THREE.DoubleSide, transparent: true });
        return material;
    }

    const textureFor = {
        side: loadedTextures[textureSide],
        top: loadedTextures[textureTop],
        bottom: loadedTextures[textureBottom],
    }

    // const materialFor = {
    //     side: (materials[textureSide]),
    //     top: materials[textureTop],
    //     bottom: materials[textureBottom],
    // }

    // faces


    for (let cube of merged.cuboids) {
        for (let [direction, face] of Object.entries(cube.faces)) {
            const faceGeo = new THREE.PlaneGeometry(face.uv[2] - face.uv[0], face.uv[3] - face.uv[1]);
            const [rotX, rotY, rotZ] = rotOfDir(direction)
            faceGeo.rotateX(rotX);
            faceGeo.rotateY(rotY);
            faceGeo.rotateZ(rotZ);
            const faceMat = makeMaterial(textureFor[face.texture], colorOfDir(direction));
            const faceMesh = new THREE.Mesh(faceGeo, faceMat);
            faceMesh.position.set(...geoOfDir(direction, cube.localBounds));
            scene.add(faceMesh);
        }
    }

    camera.position.set(16, 16, 16);
    camera.aspect = 1;
    camera.lookAt(0, 0, 0);
    renderer.setPixelRatio(1);
    renderer.setSize(highQual ? 8000 : 300, highQual ? 8000 : 300);
    renderer.render(scene, camera);

    return new Promise((resolve, reject) => {
        renderer.domElement.toBlob((blob) => {
            db.renderedModels.put({ modId, subPath, data: renderer.domElement.toDataURL("image/png") })
            resolve(URL.createObjectURL(blob));
        })
    });
}
