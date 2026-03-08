const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['pt-BR', 'en', 'es', 'ru', 'fr', 'de'];

const keys = {
    "pt-BR": {
        "backup_full_sync": "Backup Completo e Sincronização (Local)",
        "backup_full_sync_desc": "Transfira todos os seus dados do Leg3ndy Hydra (Saves dos jogos, Ajustes, Tempo de Jogo e Conquistas) entre computadores sem depender da nuvem. Totalmente criptografado localmente.",
        "backup_p2p_sync": "Sincronização P2P (Rede Wi-Fi/Local)",
        "backup_p2p_sync_desc": "Copie tudo diretamente para outro PC conectado na sua casa de forma imediata.",
        "backup_host_pc": "Hospedar Backup (Este PC)",
        "backup_host_disable": "Desativar",
        "backup_receive": "Receber Backup (Conectar)",
        "backup_manual_export": "Exportação Manual",
        "backup_manual_export_desc": "Gere um arquivo \".zip\" com todos os seus dados para arquivar em um Pendrive ou provedor de nuvem (Google Drive, OneDrive). O arquivo pode ser grande.",
        "backup_export_tar": "Exportar Backup (.tar.gz)",
        "backup_restore_tar": "Restaurar Backup (.tar.gz)",
        "backup_pairing_code": "Código de Pareamento:",
        "backup_pairing_code_help": "Informe este código no outro computador apertando 'Receber Backup'.",
        "backup_export_success": "Backup exportado com sucesso!",
        "backup_import_confirm": "Isso irá substituir TODOS os seus dados atuais e reiniciar o Leg3ndy Hydra. Deseja continuar?",
        "backup_import_error": "Ocorreu um erro ao restaurar o backup ou o processo foi cancelado.",
        "backup_host_error": "Não foi possível gerar os arquivos para enviar, seu profile pode estar vazio.",
        "backup_receive_prompt": "Insira o Código de Pareamento (IP:Porta) do Host:",
        "backup_receive_confirm": "Isso irá substituir TODOS os seus dados por meio do Host. Deseja continuar?",
        "backup_receive_error": "Falha na conexão com o Host ou na restauração dos arquivos."
    },
    "en": {
        "backup_full_sync": "Full Backup and Synchronization (Local)",
        "backup_full_sync_desc": "Transfer all your Leg3ndy Hydra data (Game Saves, Settings, Playtime, and Achievements) between computers without relying on the cloud. Fully encrypted locally.",
        "backup_p2p_sync": "P2P Synchronization (Local Wi-Fi/LAN)",
        "backup_p2p_sync_desc": "Copy everything directly to another PC connected in your house instantly.",
        "backup_host_pc": "Host Backup (This PC)",
        "backup_host_disable": "Disable",
        "backup_receive": "Receive Backup (Connect)",
        "backup_manual_export": "Manual Export",
        "backup_manual_export_desc": "Generate a \".zip\" file with all your data to store on a USB stick or cloud provider (Google Drive, OneDrive). The file might be large.",
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
        "backup_full_sync": "Copia de Seguridad Completa y Sincronización (Local)",
        "backup_full_sync_desc": "Transfiera todos sus datos de Leg3ndy Hydra (Partidas Guardadas, Ajustes, Tiempo de Juego y Logros) entre computadoras sin depender de la nube. Totalmente encriptado localmente.",
        "backup_p2p_sync": "Sincronización P2P (Rede Wi-Fi/Local)",
        "backup_p2p_sync_desc": "Copie todo directamente a otra PC conectada en su casa al instante.",
        "backup_host_pc": "Alojar Copia de Seguridad (Esta PC)",
        "backup_host_disable": "Desactivar",
        "backup_receive": "Recibir Copia de Seguridad (Conectar)",
        "backup_manual_export": "Exportación Manual",
        "backup_manual_export_desc": "Genere un archivo \".zip\" con todos sus datos para almacenar en una memoria USB o proveedor de nube (Google Drive, OneDrive). El archivo de salida puede ser grande.",
        "backup_export_tar": "Exportar Copia (.tar.gz)",
        "backup_restore_tar": "Restaurar Copia (.tar.gz)",
        "backup_pairing_code": "Código de Emparejamiento:",
        "backup_pairing_code_help": "Ingrese este código en la otra computadora haciendo clic en 'Recibir Copia de Seguridad'.",
        "backup_export_success": "¡Copia de seguridad exportada con éxito!",
        "backup_import_confirm": "Esto reemplazará TODOS sus datos actuales y reiniciará Leg3ndy Hydra. ¿Desea continuar?",
        "backup_import_error": "Ocurrió un error al restaurar la copia de seguridad o el proceso fue cancelado.",
        "backup_host_error": "No se pudieron reducir los archivos para enviar, tu perfil podría estar vacío.",
        "backup_receive_prompt": "Ingrese el Código de Emparejamiento del Host (IP:Puerto):",
        "backup_receive_confirm": "Esto reemplazará TODOS sus datos a través del Host. ¿Desea continuar?",
        "backup_receive_error": "Fallo en la conexión con el Host o en la restauración de los archivos."
    },
    "fr": {
        "backup_full_sync": "Sauvegarde Complète et Synchronisation (Locale)",
        "backup_full_sync_desc": "Transférez toutes vos données Leg3ndy Hydra (Sauvegardes, Paramètres, Temps de jeu et Succès) d'un ordinateur à l'autre sans compter sur le cloud.",
        "backup_p2p_sync": "Synchronisation P2P (Wi-Fi/Réseau local)",
        "backup_p2p_sync_desc": "Copiez instantanément tout directement vers un autre PC connecté chez vous.",
        "backup_host_pc": "Héberger la Sauvegarde (Ce PC)",
        "backup_host_disable": "Désactiver",
        "backup_receive": "Recevoir la Sauvegarde (Se connecter)",
        "backup_manual_export": "Exportation Manuelle",
        "backup_manual_export_desc": "Générez un fichier \".zip\" de toutes vos données pour les archiver sur une clé USB ou Google Drive. Le fichier peut être volumineux.",
        "backup_export_tar": "Exporter la Sauvegarde (.tar.gz)",
        "backup_restore_tar": "Restaurer la Sauvegarde (.tar.gz)",
        "backup_pairing_code": "Code de Couplage :",
        "backup_pairing_code_help": "Saisissez ce code sur l'autre ordinateur en cliquant sur 'Recevoir la Sauvegarde'.",
        "backup_export_success": "Sauvegarde exportée avec succès !",
        "backup_import_confirm": "Cela remplacera TOUTES vos données actuelles et redémarrera Leg3ndy Hydra. Voulez-vous continuer ?",
        "backup_import_error": "Une erreur est survenue lors de la restauration de la sauvegarde ou le processus a été annulé.",
        "backup_host_error": "Impossible de générer les fichiers à envoyer, votre profil est peut-être vide.",
        "backup_receive_prompt": "Entrez le Code de Couplage de l'Hôte (IP:Port) :",
        "backup_receive_confirm": "Cela remplacera TOUTES vos données via l'Hôte. Voulez-vous continuer ?",
        "backup_receive_error": "Échec de la connexion à l'Hôte ou de la restauration des fichiers."
    },
    "de": {
        "backup_full_sync": "Vollständiges Backup und Synchronisierung (Lokal)",
        "backup_full_sync_desc": "Übertragen Sie alle Ihre Leg3ndy Hydra-Daten (Spielstände, Einstellungen, Spielzeit und Erfolge) lokal zwischen Computern, ohne Cloud-Dienste zu verwenden.",
        "backup_p2p_sync": "P2P-Synchronisierung (Lokal Wi-Fi/LAN)",
        "backup_p2p_sync_desc": "Kopieren Sie alles direkt und sofort auf einen anderen verbundenen PC in Ihrem Haus.",
        "backup_host_pc": "Backup hosten (Dieser PC)",
        "backup_host_disable": "Deaktivieren",
        "backup_receive": "Backup empfangen (Verbinden)",
        "backup_manual_export": "Manueller Export",
        "backup_manual_export_desc": "Generieren Sie eine \".zip\"-Datei mit Ihren Daten für USB-Sticks oder Cloud-Speicher. Die Datei kann sehr groß werden.",
        "backup_export_tar": "Backup exportieren (.tar.gz)",
        "backup_restore_tar": "Backup wiederherstellen (.tar.gz)",
        "backup_pairing_code": "Kopplungscode:",
        "backup_pairing_code_help": "Geben Sie diesen Code auf dem anderen Computer ein, indem Sie auf 'Backup empfangen' klicken.",
        "backup_export_success": "Backup erfolgreich exportiert!",
        "backup_import_confirm": "Dadurch werden ALLE Ihre aktuellen Daten ersetzt und Leg3ndy Hydra neu gestartet. Möchten Sie fortfahren?",
        "backup_import_error": "Beim Wiederherstellen des Backups ist ein Fehler aufgetreten.",
        "backup_host_error": "Ressourcen zum Senden konnten nicht generiert werden. Möglicherweise ist Ihr Profil leer.",
        "backup_receive_prompt": "Geben Sie den Host-Kopplungscode ein (IP:Port):",
        "backup_receive_confirm": "Dadurch werden ALLE Ihre Daten durch den Host ersetzt. Möchten Sie fortfahren?",
        "backup_receive_error": "Verbindung zum Host oder Wiederherstellung der Dateien fehlgeschlagen."
    },
    "ru": {
        "backup_full_sync": "Полное резервное копирование и синхронизация (Локально)",
        "backup_full_sync_desc": "Переносите все данные Leg3ndy Hydra (Сохранения, Настройки, Время игры и Достижения) между компьютерами без использования облака.",
        "backup_p2p_sync": "Синхронизация P2P (Локальный Wi-Fi/LAN)",
        "backup_p2p_sync_desc": "Копируйте всё напрямую на другой подключенный ПК в вашем доме.",
        "backup_host_pc": "Разместить копию (Этот ПК)",
        "backup_host_disable": "Отключить",
        "backup_receive": "Получить копию (Подключиться)",
        "backup_manual_export": "Ручной экспорт",
        "backup_manual_export_desc": "Сгенерируйте \".zip\" файл со всеми вашими данными для хранения на флешке или в облаке. Файл может быть большим.",
        "backup_export_tar": "Экспорт копии (.tar.gz)",
        "backup_restore_tar": "Восстановить копию (.tar.gz)",
        "backup_pairing_code": "Код сопряжения:",
        "backup_pairing_code_help": "Введите этот код на другом компьютере, нажав 'Получить копию'.",
        "backup_export_success": "Резервная копия успешно экспортирована!",
        "backup_import_confirm": "Это заменит ВСЕ ваши текущие данные и перезапустит Leg3ndy Hydra. Хотите продолжить?",
        "backup_import_error": "Произошла ошибка при восстановлении резервной копии.",
        "backup_host_error": "Не удалось создать файлы для отправки, возможно, ваш профиль пуст.",
        "backup_receive_prompt": "Введите код сопряжения хоста (IP:Port):",
        "backup_receive_confirm": "Это заменит ВСЕ ваши данные через хост. Продолжить?",
        "backup_receive_error": "Не удалось подключиться к хосту или восстановить файлы."
    }
};

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Most translations use "settings" block, so inject there.
        if (!data.settings) {
            data.settings = {};
        }

        // Inject the keys
        if (keys[lang]) {
            Object.assign(data.settings, keys[lang]);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        console.log(`Patched ${lang}/translation.json`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
