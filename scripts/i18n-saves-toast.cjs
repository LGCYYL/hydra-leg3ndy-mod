const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de', 'pt-BR'];

const keys = {
    "en": {
        "settings_category_hydra_cloud": "Saves",
        "backup_local_save_success": "Save backed up successfully!",
        "backup_local_save_error": "Error backing up save.",
        "restore_local_save_success": "Save restored successfully!",
        "restore_local_save_error": "Error restoring save."
    },
    "es": {
        "settings_category_hydra_cloud": "Partidas Guardadas",
        "backup_local_save_success": "¡Partida respaldada con éxito!",
        "backup_local_save_error": "Error al respaldar la partida.",
        "restore_local_save_success": "¡Partida restaurada con éxito!",
        "restore_local_save_error": "Error al restaurar la partida."
    },
    "fr": {
        "settings_category_hydra_cloud": "Sauvegardes",
        "backup_local_save_success": "Sauvegarde effectuée avec succès !",
        "backup_local_save_error": "Erreur lors de la sauvegarde.",
        "restore_local_save_success": "Sauvegarde restaurée avec succès !",
        "restore_local_save_error": "Erreur lors de la restauration."
    },
    "de": {
        "settings_category_hydra_cloud": "Spielstände",
        "backup_local_save_success": "Spielstand erfolgreich gesichert!",
        "backup_local_save_error": "Fehler bei der Sicherung des Spielstands.",
        "restore_local_save_success": "Spielstand erfolgreich wiederhergestellt!",
        "restore_local_save_error": "Fehler bei der Wiederherstellung."
    },
    "ru": {
        "settings_category_hydra_cloud": "Сохранения",
        "backup_local_save_success": "Сохранение успешно зарезервировано!",
        "backup_local_save_error": "Ошибка резервного копирования.",
        "restore_local_save_success": "Сохранение успешно восстановлено!",
        "restore_local_save_error": "Ошибка восстановления сохранения."
    },
    "pt-BR": {
        "settings_category_hydra_cloud": "Saves",
        "backup_local_save_success": "Save feito com sucesso!",
        "backup_local_save_error": "Erro ao fazer backup do save.",
        "restore_local_save_success": "Save restaurado com sucesso!",
        "restore_local_save_error": "Erro ao restaurar o save."
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

            if (!data.game_details) data.game_details = {};
            Object.assign(data.game_details, keys[lang]);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            console.log(`Added game_details saves keys to ${lang}`);
        } catch (e) {
            console.error(e.message);
        }
    }
});
