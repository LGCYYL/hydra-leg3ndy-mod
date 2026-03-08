const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de', 'pt-BR'];

const keys = {
    "en": { "backup_direct": "Direct Backup" },
    "es": { "backup_direct": "Copia Directa" },
    "fr": { "backup_direct": "Sauvegarde Directe" },
    "de": { "backup_direct": "Direktes Backup" },
    "ru": { "backup_direct": "Прямая Копия" },
    "pt-BR": { "backup_direct": "Backup Direto" }
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
            console.log(`Added backup_direct to ${lang}`);
        } catch (e) {
            console.error(e.message);
        }
    }
});
