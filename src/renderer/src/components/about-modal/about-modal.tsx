import { Modal } from "@renderer/components";
import { useTranslation } from "react-i18next";
import { ShieldCheckIcon, ToolsIcon, RocketIcon } from "@primer/octicons-react";

import leg3ndyLogo from "@renderer/assets/leg3ndy.png";
import "./about-modal.scss";

export interface AboutModalProps {
    visible: boolean;
    onClose: () => void;
    version: string;
}

export function AboutModal({ visible, onClose, version }: AboutModalProps) {
    const { t } = useTranslation("about");

    return (
        <Modal visible={visible} title={t("about_title")} onClose={onClose}>
            <div className="about-modal">
                <div className="about-modal__header">
                    <img src={leg3ndyLogo} alt="LEG3NDY" className="about-modal__logo" />
                    <span className="about-modal__edition">Hydra Edition</span>
                    <span className="about-modal__version">v{version}</span>
                </div>

                <div className="about-modal__content">
                    <p className="about-modal__description">
                        {t("about_description")}
                    </p>

                    <div className="about-modal__features">
                        <div className="about-modal__feature">
                            <ShieldCheckIcon size={20} />
                            <div>
                                <strong>{t("feature_security_title")}</strong>
                                <p>{t("feature_security_desc")}</p>
                            </div>
                        </div>

                        <div className="about-modal__feature">
                            <ToolsIcon size={20} />
                            <div>
                                <strong>{t("feature_improvements_title")}</strong>
                                <p>{t("feature_improvements_desc")}</p>
                            </div>
                        </div>

                        <div className="about-modal__feature">
                            <RocketIcon size={20} />
                            <div>
                                <strong>{t("feature_updates_title")}</strong>
                                <p>{t("feature_updates_desc")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-modal__disclaimer">
                        <p>{t("disclaimer")}</p>
                    </div>
                </div>

                <div className="about-modal__footer">
                    <p className="about-modal__copyright">
                        LEG3NDY © 2026. {t("all_rights_reserved")}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
