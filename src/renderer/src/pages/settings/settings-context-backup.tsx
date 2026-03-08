import { useState } from "react";
import { Button } from "@renderer/components";
import { UploadIcon, DownloadIcon, CloudIcon, ServerIcon } from "@primer/octicons-react";
import "./settings-context-backup.scss";

export function SettingsContextBackup() {
    const [isHosting, setIsHosting] = useState(false);
    const [hostAddress, setHostAddress] = useState<string | null>(null);

    const handleExportBackup = async () => {
        const success = await window.electron.exportBackup();
        if (success) alert("Backup exportado com sucesso!");
    };

    const handleImportBackup = async () => {
        const confirm = window.confirm("Isso irá substituir TODOS os seus dados atuais e reiniciar o Leg3ndy Hydra. Deseja continuar?");
        if (!confirm) return;

        const success = await window.electron.importBackup();
        if (!success) alert("Ocorreu um erro ao restaurar o backup ou o processo foi cancelado.");
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
            alert("Não foi possível gerar os arquivos para enviar, seu profile pode estar vazio.");
        }
    };

    const handleReceiveBackup = async () => {
        const address = window.prompt("Insira o Código de Pareamento (IP:Porta) do Host:");
        if (!address) return;

        const confirm = window.confirm("Isso irá substituir TODOS os seus dados por meio do Host. Deseja continuar?");
        if (!confirm) return;

        const success = await window.electron.receiveBackup(address);
        if (!success) alert("Falha na conexão com o Host ou na restauração dos arquivos.");
    };

    return (
        <div className="settings-context-panel">
            <div className="settings-context-panel__group">
                <h3>Backup Completo e Sincronização (Local)</h3>
                <p style={{ margin: "4px 0 16px 0", color: "#A0A0A0", fontSize: "14px", lineHeight: "1.5" }}>
                    Transfira todos os seus dados do Leg3ndy Hydra (Saves dos jogos, Ajustes, Tempo de Jogo e Conquistas) entre computadores sem depender da nuvem. Totalmente criptografado localmente.
                </p>
            </div>

            <div className="settings-context-panel__group">
                <h3>Sincronização P2P (Rede Wi-Fi/Local)</h3>
                <p style={{ margin: "4px 0 16px 0", color: "#A0A0A0", fontSize: "14px", lineHeight: "1.5" }}>
                    Copie tudo diretamente para outro PC conectado na sua casa de forma imediata.
                </p>

                <div className="settings-backup__actions">
                    <Button onClick={handleHostBackup} theme="primary" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <ServerIcon />
                        {isHosting ? "Desativar" : "Hospedar Backup (Este PC)"}
                    </Button>
                    <Button onClick={handleReceiveBackup} theme="outline" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isHosting}>
                        <CloudIcon />
                        Receber Backup (Conectar)
                    </Button>
                </div>
                {isHosting && hostAddress && (
                    <div style={{ marginTop: 16, padding: "12px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px" }}>
                        <strong>Código de Pareamento:</strong> <span style={{ fontFamily: "monospace", marginLeft: 8, fontSize: "16px", color: "var(--color-primary)" }}>{hostAddress}</span>
                        <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#A0A0A0" }}>Informe este código no outro computador apertando "Receber Backup".</p>
                    </div>
                )}
            </div>

            <div className="settings-context-panel__group">
                <h3>Exportação Manual</h3>
                <p style={{ margin: "4px 0 16px 0", color: "#A0A0A0", fontSize: "14px", lineHeight: "1.5" }}>
                    Gere um arquivo ".zip" com todos os seus dados para arquivar em um Pendrive ou provedor de nuvem (Google Drive, OneDrive). O arquivo pode ser grande.
                </p>

                <div className="settings-backup__actions">
                    <Button onClick={handleExportBackup} theme="outline" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isHosting}>
                        <UploadIcon />
                        Exportar Backup (.tar.gz)
                    </Button>
                    <Button onClick={handleImportBackup} theme="outline" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isHosting}>
                        <DownloadIcon />
                        Restaurar Backup (.tar.gz)
                    </Button>
                </div>
            </div>
        </div>
    );
}
