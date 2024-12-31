export async function store(name, meta) {
    localStorage.setItem(name, JSON.stringify(meta));
    console.info("Set", name, "to", meta);
};

export async function load(name) {
    return JSON.parse(localStorage.getItem(name) || "null");
};