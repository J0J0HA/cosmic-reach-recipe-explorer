export async function store(name, meta) {
    localStorage.setItem(name, JSON.stringify(meta));
    console.log("Set", name, "to", meta);
};

export async function load(name) {
    return JSON.parse(localStorage.getItem(name) || "null");
};