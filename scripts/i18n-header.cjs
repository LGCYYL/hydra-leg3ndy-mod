const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de', 'pt-BR'];

const keys = {
    "en": {
        "version_available_download": "Version {{version}} available. Click here to download.",
        "version_available_install": "Version {{version}} available. Click here to restart and install."
    },
    "es": {
        "version_available_download": "Versión {{version}} disponible. Haz clic aquí para descargar.",
        "version_available_install": "Versión {{version}} disponible. Haz clic aquí para reiniciar e instalar."
    },
    "fr": {
        "version_available_download": "Version {{version}} disponible. Cliquez ici pour télécharger.",
        "version_available_install": "Version {{version}} disponible. Cliquez ici pour redémarrer et installer."
    },
    "de": {
        "version_available_download": "Version {{version}} verfügbar. Klicken Sie hier zum Herunterladen.",
        "version_available_install": "Version {{version}} verfügbar. Klicken Sie hier, um neu zu starten und zu installieren."
    },
    "ru": {
        "version_available_download": "Доступна версия {{version}}. Нажмите здесь для загрузки.",
        "version_available_install": "Доступна версия {{version}}. Нажмите здесь для перезапуска и установки."
    },
    "pt-BR": {
        "version_available_download": "Versão {{version}} disponível. Clique aqui para baixar.",
        "version_available_install": "Versão {{version}} disponível. Clique aqui para reiniciar e instalar."
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

            if (!data.header) data.header = {};
            Object.assign(data.header, keys[lang]);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            console.log(`Added header update keys to ${lang}`);
        } catch (e) {
            console.error(e.message);
        }
    }
});
