class Block {
    constructor(id, name, model, properties) {
        this.id = id;
        this.name = name;
        this.model = model;
        this.properties = properties;
    }
}

class Item {
    constructor(id, name, model, properties) {
        this.id = id;
        this.name = name;
        this.model = model;
        this.properties = properties;
    }
}	

class BlockState {
    constructor(block, state, properties) {
        this.block = block;
        this.state = state;
        this.id = `${block}[${state}]`;
        this.properties = properties;
    }
}

class Recipe {
    constructor(id, type, properties) {
        this.id = id;
        this.type = type;
        this.properties = properties;
    }
}

class Texture {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;
    }
}

class Model {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;
    }
}

export { Block, Item, BlockState, Recipe, Texture, Model };