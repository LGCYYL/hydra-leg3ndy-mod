const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const folders = fs.readdirSync(localesDir);

folders.forEach(folder => {
    const file = path.join(localesDir, folder, 'translation.json');
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Replace "Hydra" with "Leg3ndy Hydra" in specific contexts
        content = content.replace(/"title": "Activate Hydra"/g, '"title": "Activate Leg3ndy Hydra"');
        content = content.replace(/Hydra could not extract this archive/g, 'Hydra could not extract this archive'); // keeping this one generic
        content = content.replace(/Don't hide Hydra when closing/g, "Don't hide Leg3ndy Hydra when closing");
        content = content.replace(/Launch Hydra on system/g, "Launch Leg3ndy Hydra on system");
        content = content.replace(/Open Hydra/g, "Open Leg3ndy Hydra");
        content = content.replace(/Welcome back to Hydra/g, "Welcome back to Leg3ndy Hydra");
        content = content.replace(/downloaded anything with Hydra/g, "downloaded anything with Leg3ndy Hydra");
        content = content.replace(/Hydra is updating/g, "Leg3ndy Hydra is updating");

        // Replace other language equivalents by blindly doing a smart global replace on "Hydra"
        // that are NOT followed by specific words like "Cloud", "API", launcher
        // This is a rough heuristic to re-brand the newly fetched upstream translations
        content = content.replace(/([ \w]|^)Hydra([ \w]|$)/g, (match, p1, p2) => {
            if (match.includes("Hydra Cloud") || match.includes("Hydra API") || match.includes("Hydra Decky")) {
                return match;
            }
            if (p1 === '"' || p2 === '"' || p1 === ' ' || p2 === ' ' || p1 === '' || p2 === '') {
                return match.replace("Hydra", "Leg3ndy Hydra");
            }
            return match;
        });

        // Cleanup double replacements
        content = content.replace(/Leg3ndy Leg3ndy Hydra/g, "Leg3ndy Hydra");

        fs.writeFileSync(file, content);
        console.log(`Re-branded ${folder}`);
    }
});
console.log("Translation branding applied.");
