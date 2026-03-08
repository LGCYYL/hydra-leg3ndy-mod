const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de', 'pt-BR'];

const keys = {
    "en": {
        "delete_local_save": "Delete Backup",
        "delete_local_save_success": "Backup deleted successfully!",
        "delete_local_save_error": "Error deleting backup."
    },
    "es": {
        "delete_local_save": "Borrar Respaldo",
        "delete_local_save_success": "¡Respaldo borrado con éxito!",
        "delete_local_save_error": "Error al borrar el respaldo."
    },
    "fr": {
        "delete_local_save": "Supprimer la Sauvegarde",
        "delete_local_save_success": "Sauvegarde supprimée avec succès !",
        "delete_local_save_error": "Erreur lors de la suppression de la sauvegarde."
    },
    "de": {
        "delete_local_save": "Sicherung löschen",
        "delete_local_save_success": "Sicherung erfolgreich gelöscht!",
        "delete_local_save_error": "Fehler beim Löschen der Sicherung."
    },
    "ru": {
        "delete_local_save": "Удалить Резервную Копию",
        "delete_local_save_success": "Резервная копия успешно удалена!",
        "delete_local_save_error": "Ошибка при удалении резервной копии."
    },
    "pt-BR": {
        "delete_local_save": "Apagar Backup",
        "delete_local_save_success": "Backup apagado com sucesso!",
        "delete_local_save_error": "Erro ao apagar o backup."
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
            console.log(`Added delete_local_save keys to ${lang}`);
        } catch (e) {
            console.error(e.message);
        }
    }
});
