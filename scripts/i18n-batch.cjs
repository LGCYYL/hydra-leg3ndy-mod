const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de'];

const settingsKeys = {
    "en": {
        "backup_full_sync": "Full Backup and Synchronization (Local)",
        "backup_full_sync_desc": "Transfer all your Leg3ndy Hydra data (Game Saves, Settings, Playtime, and Achievements) between computers without relying on the cloud. Fully encrypted locally.",
        "backup_p2p_sync": "P2P Synchronization (Local Wi-Fi/LAN)",
        "backup_p2p_sync_desc": "Copy everything directly to another PC connected in your house instantly.",
        "backup_host_pc": "Host Backup (This PC)",
        "backup_host_disable": "Disable",
        "backup_receive": "Receive Backup (Connect)",
        "backup_manual_export": "Manual Export",
        "backup_manual_export_desc": "Generate a \".zip\" file with all your data to store on a USB stick or cloud provider. The file might be large.",
        "backup_export_tar": "Export Backup (.tar.gz)",
        "backup_restore_tar": "Restore Backup (.tar.gz)",
        "backup_pairing_code": "Pairing Code:",
        "backup_pairing_code_help": "Enter this code on the other computer by clicking 'Receive Backup'.",
        "backup_export_success": "Backup exported successfully!",
        "backup_import_confirm": "This will replace ALL your current data and restart Leg3ndy Hydra. Do you wish to continue?",
        "backup_import_error": "An error occurred while restoring the backup or the process was canceled.",
        "backup_host_error": "Could not generate files to send, your profile might be empty.",
        "backup_receive_prompt": "Enter the Host Pairing Code (IP:Port):",
        "backup_receive_confirm": "This will replace ALL your data via the Host. Do you wish to continue?",
        "backup_receive_error": "Failed to connect to Host or restore files."
    },
    "es": {
        "backup_full_sync": "Copia de Seguridad y Sincronización (Local)",
        "backup_full_sync_desc": "Transfiera todos sus datos de Leg3ndy Hydra (Partidas Guardadas, Ajustes, Tiempo de Juego y Logros) libremente. Totalmente encriptado localmente.",
        "backup_p2p_sync": "Sincronización P2P (Wi-Fi/Local)",
        "backup_p2p_sync_desc": "Copie todo directamente a otra PC conectada en su casa al instante.",
        "backup_host_pc": "Alojar Copia de Seguridad (Esta PC)",
        "backup_host_disable": "Desactivar",
        "backup_receive": "Recibir Copia de Seguridad (Conectar)",
        "backup_manual_export": "Exportación Manual",
        "backup_manual_export_desc": "Genere un archivo \".zip\" con todos sus datos. El archivo de salida puede ser grande.",
        "backup_export_tar": "Exportar Copia (.tar.gz)",
        "backup_restore_tar": "Restaurar Copia (.tar.gz)",
        "backup_pairing_code": "Código de Emparejamiento:",
        "backup_pairing_code_help": "Ingrese este código en la otra computadora desde 'Recibir Copia'.",
        "backup_export_success": "¡Copia de seguridad exportada con éxito!",
        "backup_import_confirm": "Esto reemplazará TODOS sus datos actuales y reiniciará Leg3ndy Hydra. ¿Desea continuar?",
        "backup_import_error": "Ocurrió un error al restaurar la copia de seguridad.",
        "backup_host_error": "No hay archivos para enviar, tu perfil podría estar vacío.",
        "backup_receive_prompt": "Ingrese el Código de Emparejamiento del Host (IP:Puerto):",
        "backup_receive_confirm": "Esto reemplazará TODOS sus datos a través del Host. ¿Desea continuar?",
        "backup_receive_error": "Fallo en la conexión o en la restauración de los archivos."
    },
    "fr": {
        "backup_full_sync": "Sauvegarde Complète (Locale)",
        "backup_full_sync_desc": "Transférez toutes vos données Leg3ndy Hydra (Sauvegardes, Paramètres et Succès) d'un ordinateur à l'autre sans cloud.",
        "backup_p2p_sync": "Synchronisation P2P (Wi-Fi/Réseau local)",
        "backup_p2p_sync_desc": "Copiez instantanément tout directement vers un autre PC connecté chez vous.",
        "backup_host_pc": "Héberger la Sauvegarde (Ce PC)",
        "backup_host_disable": "Désactiver",
        "backup_receive": "Recevoir la Sauvegarde (Se connecter)",
        "backup_manual_export": "Exportation Manuelle",
        "backup_manual_export_desc": "Générez un fichier \".zip\" de toutes vos données pour les archiver sur une clé USB.",
        "backup_export_tar": "Exporter la Sauvegarde",
        "backup_restore_tar": "Restaurer la Sauvegarde",
        "backup_pairing_code": "Code de Couplage :",
        "backup_pairing_code_help": "Saisissez ce code sur l'autre ordinateur.",
        "backup_export_success": "Sauvegarde exportée avec succès !",
        "backup_import_confirm": "Cela remplacera TOUTES vos données actuelles. Voulez-vous continuer ?",
        "backup_import_error": "Une erreur est survenue lors de la restauration.",
        "backup_host_error": "Impossible de générer les fichiers à envoyer.",
        "backup_receive_prompt": "Entrez le Code de Couplage de l'Hôte :",
        "backup_receive_confirm": "Cela remplacera TOUTES vos données. Voulez-vous continuer ?",
        "backup_receive_error": "Échec de la connexion ou de la restauration des fichiers."
    },
    "de": {
        "backup_full_sync": "Vollständiges Backup (Lokal)",
        "backup_full_sync_desc": "Übertragen Sie alle Ihre Leg3ndy Hydra-Daten (Spielstände, Einstellungen, Erfolge) lokal zwischen Computern.",
        "backup_p2p_sync": "P2P-Synchronisierung (Wi-Fi/LAN)",
        "backup_p2p_sync_desc": "Kopieren Sie alles direkt und sofort auf einen anderen verbundenen PC.",
        "backup_host_pc": "Backup hosten (Dieser PC)",
        "backup_host_disable": "Deaktivieren",
        "backup_receive": "Backup empfangen (Verbinden)",
        "backup_manual_export": "Manueller Export",
        "backup_manual_export_desc": "Generieren Sie eine \".zip\"-Datei mit Ihren Daten für USB-Sticks oder Cloud.",
        "backup_export_tar": "Backup exportieren",
        "backup_restore_tar": "Backup wiederherstellen",
        "backup_pairing_code": "Kopplungscode:",
        "backup_pairing_code_help": "Geben Sie diesen Code auf dem anderen Computer ein.",
        "backup_export_success": "Backup erfolgreich exportiert!",
        "backup_import_confirm": "Dadurch werden ALLE Ihre aktuellen Daten ersetzt. Möchten Sie fortfahren?",
        "backup_import_error": "Beim Wiederherstellen des Backups ist ein Fehler aufgetreten.",
        "backup_host_error": "Ressourcen konnten nicht generiert werden.",
        "backup_receive_prompt": "Geben Sie den Host-Kopplungscode ein:",
        "backup_receive_confirm": "Dadurch werden ALLE Ihre Daten ersetzt. Möchten Sie fortfahren?",
        "backup_receive_error": "Verbindung zum Host oder Wiederherstellung der Dateien fehlgeschlagen."
    },
    "ru": {
        "backup_full_sync": "Полное резервное копирование и синхронизация (Локально)",
        "backup_full_sync_desc": "Переносите все данные Leg3ndy Hydra между компьютерами без использования облака.",
        "backup_p2p_sync": "Синхронизация P2P (Локальный Wi-Fi/LAN)",
        "backup_p2p_sync_desc": "Копируйте всё напрямую на другой подключенный ПК в вашем доме.",
        "backup_host_pc": "Разместить копию (Этот ПК)",
        "backup_host_disable": "Отключить",
        "backup_receive": "Получить копию (Подключиться)",
        "backup_manual_export": "Ручной экспорт",
        "backup_manual_export_desc": "Сгенерируйте \".zip\" файл со всеми вашими данными для хранения на флешке.",
        "backup_export_tar": "Экспорт копии",
        "backup_restore_tar": "Восстановить копию",
        "backup_pairing_code": "Код сопряжения:",
        "backup_pairing_code_help": "Введите этот код на другом компьютере.",
        "backup_export_success": "Резервная копия успешно экспортирована!",
        "backup_import_confirm": "Это заменит ВСЕ ваши текущие данные. Хотите продолжить?",
        "backup_import_error": "Произошла ошибка при восстановлении резервной копии.",
        "backup_host_error": "Не удалось создать файлы для отправки.",
        "backup_receive_prompt": "Введите код сопряжения хоста (IP:Port):",
        "backup_receive_confirm": "Это заменит ВСЕ ваши данные через хост. Продолжить?",
        "backup_receive_error": "Не удалось подключиться к хосту или восстановить файлы."
    }
};

const aboutKeys = {
    "en": {
        "about_title": "About",
        "about_description": "Welcome to Leg3ndy Hydra. The premiere game distribution software focused on a clean, secure player experience.",
        "feature_security_title": "Security Focused",
        "feature_security_desc": "Tracker removal to focus 100% on a clean software focused on user freedom.",
        "feature_improvements_title": "Stability Improvements",
        "feature_improvements_desc": "Performance optimizations to deliver a fluid interface.",
        "feature_updates_title": "Constant Updates",
        "feature_updates_desc": "Stay up to date with automatic updates and fast integrations.",
        "disclaimer": "Leg3ndy Hydra has no affiliation against violations of improper use and does not log P2P.",
        "all_rights_reserved": "All rights reserved."
    },
    "es": {
        "about_title": "Acerca de",
        "about_description": "Bienvenido a Leg3ndy Hydra. El software de distribución de juegos centrado en una experiencia limpia y segura.",
        "feature_security_title": "Seguridad Enfocada",
        "feature_security_desc": "Eliminación de rastreadores para enfocarse 100% en el software limpio",
        "feature_improvements_title": "Mejoras de Estabilidad",
        "feature_improvements_desc": "Optimizaciones de rendimiento para ofrecer una interfaz fluida.",
        "feature_updates_title": "Actualizaciones Constantes",
        "feature_updates_desc": "Manténgase al día con actualizaciones automáticas e integraciones rápidas.",
        "disclaimer": "Leg3ndy Hydra no guarda P2P y es libre de afiliaciones.",
        "all_rights_reserved": "Todos los derechos reservados."
    },
    "fr": {
        "about_title": "À propos",
        "about_description": "Bienvenue sur Leg3ndy Hydra. Le premier logiciel de distribution de jeux axé sur une expérience propre et sécurisée.",
        "feature_security_title": "Axé sur la Sécurité",
        "feature_security_desc": "Suppression des traqueurs pour se concentrer à 100 % sur un logiciel propre.",
        "feature_improvements_title": "Améliorations de Stabilité",
        "feature_improvements_desc": "Optimisations des performances pour offrir une interface fluide.",
        "feature_updates_title": "Mises à jour Constantes",
        "feature_updates_desc": "Restez à jour avec des mises à jour automatiques et des intégrations rapides.",
        "disclaimer": "Leg3ndy Hydra n'enregistre pas le P2P.",
        "all_rights_reserved": "Tous droits réservés."
    },
    "de": {
        "about_title": "Über",
        "about_description": "Willkommen bei Leg3ndy Hydra. Die beste Spielvertriebssoftware für ein sauberes und sicheres Erlebnis.",
        "feature_security_title": "Sicherheit Fokussiert",
        "feature_security_desc": "Tracker-Entfernung, um sich 100% auf saubere Software zu konzentrieren.",
        "feature_improvements_title": "Stabilitätsverbesserungen",
        "feature_improvements_desc": "Leistungsoptimierungen für eine flüssige Oberfläche.",
        "feature_updates_title": "Ständige Updates",
        "feature_updates_desc": "Bleiben Sie mit automatischen Updates und schnellen Integrationen auf dem Laufenden.",
        "disclaimer": "Leg3ndy Hydra protokolliert kein P2P.",
        "all_rights_reserved": "Alle Rechte vorbehalten."
    },
    "ru": {
        "about_title": "О программе",
        "about_description": "Добро пожаловать в Leg3ndy Hydra. Премьерное ПО для распространения игр, ориентированное на чистый и безопасный опыт.",
        "feature_security_title": "Ориентирован на безопасность",
        "feature_security_desc": "Удаление трекеров для обеспечения 100% чистого ПО.",
        "feature_improvements_title": "Улучшения стабильности",
        "feature_improvements_desc": "Оптимизация производительности для обеспечения плавности интерфейса.",
        "feature_updates_title": "Постоянные обновления",
        "feature_updates_desc": "Оставайтесь в курсе благодаря автоматическим обновлениям.",
        "disclaimer": "Leg3ndy Hydra не регистрирует P2P.",
        "all_rights_reserved": "Все права защищены."
    }
};

const achievementsKeys = {
    "en": {
        "how_to_earn_achievements_points": "How to unlock achievement points?",
        "locked_achievement": "Locked achievement",
        "points_explanation_1": "Achievement points are earned by unlocking achievements in games.",
        "points_explanation_2": "Harder and rarer achievements are worth more points. Rarity is calculated based on the percentage of players who have unlocked each achievement."
    },
    "es": {
        "how_to_earn_achievements_points": "¿Cómo desbloquear puntos de logros?",
        "locked_achievement": "Logro bloqueado",
        "points_explanation_1": "Los puntos de logros se ganan al desbloquear logros en los juegos.",
        "points_explanation_2": "Los logros más raros y difíciles valen más puntos. La rareza se calcula según el porcentaje de jugadores."
    },
    "fr": {
        "how_to_earn_achievements_points": "Comment débloquer des points de succès ?",
        "locked_achievement": "Succès verrouillé",
        "points_explanation_1": "Les points de succès sont gagnés en débloquant des succès dans les jeux.",
        "points_explanation_2": "Les succès les plus difficiles et les plus rares valent plus de points. La rareté est calculée."
    },
    "de": {
        "how_to_earn_achievements_points": "Wie schalte ich Erfolgspunkte frei?",
        "locked_achievement": "Gesperrter Erfolg",
        "points_explanation_1": "Erfolgspunkte erhalten Sie durch das Freischalten von Erfolgen in Spielen.",
        "points_explanation_2": "Seltenere Erfolge sind mehr Punkte wert. Die Seltenheit wird berechnet."
    },
    "ru": {
        "how_to_earn_achievements_points": "Как разблокировать очки достижений?",
        "locked_achievement": "Заблокированное достижение",
        "points_explanation_1": "Очки достижений зарабатываются путем разблокировки достижений в играх.",
        "points_explanation_2": "Более редкие достижения стоят больше очков."
    }
};

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        try {
            // Read file and explicitly strip UTF-8 BOM if present
            let fileContent = fs.readFileSync(filePath, 'utf8');
            if (fileContent.charCodeAt(0) === 0xFEFF) {
                fileContent = fileContent.slice(1);
            }

            const data = JSON.parse(fileContent);

            // Inject Settings Keys
            if (!data.settings) data.settings = {};
            if (settingsKeys[lang]) Object.assign(data.settings, settingsKeys[lang]);

            // Inject About Keys
            if (!data.about) data.about = {};
            if (aboutKeys[lang]) Object.assign(data.about, aboutKeys[lang]);

            // Inject Achievements Keys
            if (!data.achievements) data.achievements = {};
            if (achievementsKeys[lang]) Object.assign(data.achievements, achievementsKeys[lang]);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            console.log(`Successfully patched ${lang}/translation.json`);
        } catch (e) {
            console.error(`Error processing ${lang}: ${e.message}`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
