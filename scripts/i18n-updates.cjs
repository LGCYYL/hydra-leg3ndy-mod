const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de', 'pt-BR'];

const keys = {
    "en": {
        "updates": "Updates",
        "updates_description": "Leg3ndy Hydra automatically searches for updates in the background. If a new version is available, it will be highlighted prominently at the top of the application.",
        "check_for_updates": "Check for Updates"
    },
    "es": {
        "updates": "Actualizaciones",
        "updates_description": "Leg3ndy Hydra busca actualizaciones automáticamente en segundo plano. Si hay una nueva versión disponible, aparecerá resaltada en la parte superior de la aplicación.",
        "check_for_updates": "Buscar Actualizaciones"
    },
    "fr": {
        "updates": "Mises à jour",
        "updates_description": "Leg3ndy Hydra recherche automatiquement des mises à jour en arrière-plan. Si une nouvelle version est disponible, elle sera mise en évidence en haut de l'application.",
        "check_for_updates": "Vérifier les Mises à Jour"
    },
    "de": {
        "updates": "Updates",
        "updates_description": "Leg3ndy Hydra sucht im Hintergrund automatisch nach Updates. Wenn eine neue Version verfügbar ist, wird sie oben in der Anwendung hervorgehoben angezeigt.",
        "check_for_updates": "Nach Updates suchen"
    },
    "ru": {
        "updates": "Обновления",
        "updates_description": "Leg3ndy Hydra автоматически ищет обновления в фоновом режиме. Если доступна новая версия, она будет выделена в верхней части приложения.",
        "check_for_updates": "Проверить Обновления"
    },
    "pt-BR": {
        "updates": "Atualizações",
        "updates_description": "O Leg3ndy Hydra procura atualizações automaticamente em background. Caso haja uma nova versão disponível, ela aparecerá de forma destacada no topo do aplicativo.",
        "check_for_updates": "Verificar Novas Versões"
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
            console.log(`Added update keys to ${lang}`);
        } catch (e) {
            console.error(e.message);
        }
    }
});
