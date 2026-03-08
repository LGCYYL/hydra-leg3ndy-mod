const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de', 'pt-BR'];

const keys = {
    "en": {
        "verifying_updates": "Searching for updates in the cloud..."
    },
    "es": {
        "verifying_updates": "Buscando actualizaciones en la nube..."
    },
    "fr": {
        "verifying_updates": "Recherche de mises à jour dans le cloud..."
    },
    "de": {
        "verifying_updates": "Suchen nach Updates in der Cloud..."
    },
    "ru": {
        "verifying_updates": "Поиск обновлений в облаке..."
    },
    "pt-BR": {
        "verifying_updates": "Buscando atualizações na nuvem..."
    }
};

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        try {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            if (fileContent.charCodeAt(0) === 0xFEFF) {
                fileContent = fileContent.slice(1);
            }
            const data = JSON.parse(fileContent);

            if (!data.settings) data.settings = {};
            Object.assign(data.settings, keys[lang]);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            console.log(`Added verifying update keys to ${lang}`);
        } catch (e) {
            console.error(e.message);
        }
    }
});
