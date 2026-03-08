import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@renderer/components";
import { UploadIcon, DownloadIcon, CloudIcon, ServerIcon } from "@primer/octicons-react";
import "./settings-context-backup.scss";

export function SettingsContextBackup() {
    const { t } = useTranslation("settings");
    const [isHosting, setIsHosting] = useState(false);
    const [hostAddress, setHostAddress] = useState<string | null>(null);

    const handleExportBackup = async () => {
        const success = await window.electron.exportBackup();
        if (success) alert(t("backup_export_success"));
    };

    const handleImportBackup = async () => {
        const confirm = window.confirm(t("backup_import_confirm"));
        if (!confirm) return;

        const success = await window.electron.importBackup();
        if (!success) alert(t("backup_import_error"));
    };

    const handleHostBackup = async () => {
        if (isHosting) {
            await window.electron.stopHostBackup();
            setIsHosting(false);
            setHostAddress(null);
            return;
        }

        const address = await window.electron.hostBackup();
        if (address) {
            setHostAddress(address);
            setIsHosting(true);
        } else {
            alert(t("backup_host_error"));
        }
    };

    const handleReceiveBackup = async () => {
        const address = window.prompt(t("backup_receive_prompt"));
        if (!address) return;

        const confirm = window.confirm(t("backup_receive_confirm"));
        if (!confirm) return;

        const success = await window.electron.receiveBackup(address);
        if (!success) alert(t("backup_receive_error"));
    };

    return (
        <div className="settings-context-panel">
            <div className="settings-context-panel__group">
                <h3>{t("backup_full_sync")}</h3>
                <p style={{ margin: "4px 0 16px 0", color: "#A0A0A0", fontSize: "14px", lineHeight: "1.5" }}>
                    {t("backup_full_sync_desc")}
                </p>
            </div>

            <div className="settings-context-panel__group">
                <h3>{t("backup_p2p_sync")}</h3>
                <p style={{ margin: "4px 0 16px 0", color: "#A0A0A0", fontSize: "14px", lineHeight: "1.5" }}>
                    {t("backup_p2p_sync_desc")}
                </p>

                <div className="settings-backup__actions">
                    <Button onClick={handleHostBackup} theme="primary" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <ServerIcon />
                        {isHosting ? t("backup_host_disable") : t("backup_host_pc")}
                    </Button>
                    <Button onClick={handleReceiveBackup} theme="outline" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isHosting}>
                        <CloudIcon />
                        {t("backup_receive")}
                    </Button>
                </div>
                {isHosting && hostAddress && (
                    <div style={{ marginTop: 16, padding: "12px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px" }}>
                        <strong>{t("backup_pairing_code")}</strong> <span style={{ fontFamily: "monospace", marginLeft: 8, fontSize: "16px", color: "var(--color-primary)" }}>{hostAddress}</span>
                        <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#A0A0A0" }}>{t("backup_pairing_code_help")}</p>
                    </div>
                )}
            </div>

            <div className="settings-context-panel__group">
                <h3>{t("backup_manual_export")}</h3>
                <p style={{ margin: "4px 0 16px 0", color: "#A0A0A0", fontSize: "14px", lineHeight: "1.5" }}>
                    {t("backup_manual_export_desc")}
                </p>

                <div className="settings-backup__actions">
                    <Button onClick={handleExportBackup} theme="outline" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isHosting}>
                        <UploadIcon />
                        {t("backup_export_tar")}
                    </Button>
                    <Button onClick={handleImportBackup} theme="outline" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isHosting}>
                        <DownloadIcon />
                        {t("backup_restore_tar")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
