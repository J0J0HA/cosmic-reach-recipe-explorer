export function fileify(files) {
    return Object.fromEntries(Object.entries(files).map(([path, content]) => {
        return [path, {
            readBlob: async () => {
                return new Blob([await this.readText()], {
                    type: 'text/plain'
                });;
            },
            readText: async () => {
                return JSON.stringify(content);
            },
            readJson: async () => {
                return content;
            },
        }]
    }))
};


export const patch_files = fileify({
    "__patch_base_ores/worldgen/ores/ore_gold.json": {
        "ore":
        {
            "blockId": "base:ore_gold",
            "MaxElevation": -32,
            "MinElevation": -1073741824,
            "MaxOresPerCluster": 10,
            "AttemptsPerColumn": 2,
            "tagsOfBlocksToReplace": "ore_replaceable"
        }
    },
    "__patch_base_ores/worldgen/ores/ore_iron.json": {
        "ore":
        {
            "blockId": "base:ore_iron",
            "MaxElevation": 0,
            "MinElevation": -1073741824,
            "MaxOresPerCluster": 5,
            "AttemptsPerColumn": 8,
            "tagsOfBlocksToReplace": "ore_replaceable"
        }
    },
    "__patch_base_ores/worldgen/ores/ore_bauxite.json": {
        "ore":
        {
            "blockId": "base:ore_bauxite",
            "MaxElevation": 128,
            "MinElevation": 0,
            "MaxOresPerCluster": 6,
            "AttemptsPerColumn": 5,
            "tagsOfBlocksToReplace": "ore_replaceable"
        }
    }
});