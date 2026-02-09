import { useTranslation } from "react-i18next";
import HydraIcon from "@renderer/assets/icons/hydra.svg?react";
import { UserAchievement } from "@types";
import { useContext, useState } from "react";
import { gameDetailsContext } from "@renderer/context";
import { Modal, Button } from "@renderer/components";
import "./achievement-panel.scss";

export interface AchievementPanelProps {
  achievements?: UserAchievement[];
}

export function AchievementPanel() {
  const { t } = useTranslation("achievement");
  const { achievements } = useContext(gameDetailsContext);
  const [showPointsModal, setShowPointsModal] = useState(false);

  if (!achievements || achievements.length === 0) {
    return null;
  }

  const achievementsPointsTotal = achievements.reduce(
    (acc, achievement) => acc + (achievement.points ?? 0),
    0
  );

  const achievementsPointsEarnedSum = achievements.reduce(
    (acc, achievement) =>
      acc + (achievement.unlocked ? (achievement.points ?? 0) : 0),
    0
  );

  return (
    <>
      <div className="achievement-panel">
        <div className="achievement-panel__content">
          {t("earned_points")}{" "}
          <HydraIcon className="achievement-panel__content-icon" />
          {achievementsPointsEarnedSum} / {achievementsPointsTotal}
        </div>
        <button
          type="button"
          className="achievement-panel__help-link"
          onClick={() => setShowPointsModal(true)}
        >
          {t("how_to_earn_achievements_points")}
        </button>
      </div>

      <Modal
        visible={showPointsModal}
        title={t("how_to_earn_achievements_points")}
        onClose={() => setShowPointsModal(false)}
      >
        <div className="achievement-panel__modal-content">
          <p>{t("points_explanation_1")}</p>
          <p>{t("points_explanation_2")}</p>
        </div>
        <Button onClick={() => setShowPointsModal(false)} style={{ marginTop: 16 }}>
          {t("close", { ns: "game_details" })}
        </Button>
      </Modal>
    </>
  );
}
