import { useState } from "react";
import { useAppSelector, useDate } from "@renderer/hooks";
import type { UserAchievement } from "@types";
import { useTranslation } from "react-i18next";
import { EyeClosedIcon } from "@primer/octicons-react";
import HydraIcon from "@renderer/assets/icons/hydra.svg?react";
import { Modal } from "@renderer/components";
import "./achievements.scss";

interface AchievementListProps {
  achievements: UserAchievement[];
}

export function AchievementList({
  achievements,
}: Readonly<AchievementListProps>) {
  const { t } = useTranslation("achievement");
  const { formatDateTime } = useDate();
  const [previewAchievement, setPreviewAchievement] =
    useState<UserAchievement | null>(null);

  const userPreferences = useAppSelector(
    (state) => state.userPreferences.value
  );
  const showHiddenAchievementsDescription =
    userPreferences?.showHiddenAchievementsDescription ?? false;

  const handleImageClick = (achievement: UserAchievement) => {
    // Only allow preview for unlocked achievements
    if (achievement.unlocked) {
      setPreviewAchievement(achievement);
    }
  };

  const handleClosePreview = () => {
    setPreviewAchievement(null);
  };

  const getAchievementDescription = (achievement: UserAchievement) => {
    // Show description if unlocked
    if (achievement.unlocked) {
      return achievement.description;
    }
    // Show description for locked if user preference allows
    if (showHiddenAchievementsDescription) {
      return achievement.description;
    }
    // Hide description for locked achievements
    return t("locked_achievement");
  };

  return (
    <>
      <Modal
        visible={previewAchievement !== null}
        title={previewAchievement?.displayName ?? ""}
        onClose={handleClosePreview}
      >
        {previewAchievement && (
          <div className="achievements__preview-modal">
            <img
              src={previewAchievement.icon}
              alt={previewAchievement.displayName}
              className="achievements__preview-modal__image"
            />
            <div className="achievements__preview-modal__content">
              <p className="achievements__preview-modal__description">
                {previewAchievement.description}
              </p>
              {previewAchievement.points != undefined && (
                <div className="achievements__preview-modal__points">
                  <HydraIcon className="achievements__preview-modal__points-icon" />
                  <span>{previewAchievement.points} pontos</span>
                </div>
              )}
              {previewAchievement.unlockTime && (
                <small className="achievements__preview-modal__unlock-time">
                  {t("unlocked_at", {
                    date: formatDateTime(previewAchievement.unlockTime),
                  })}
                </small>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ul className="achievements__list">
        {achievements.map((achievement) => (
          <li key={achievement.name} className="achievements__item">
            <img
              className={`achievements__item-image ${!achievement.unlocked ? "achievements__item-image--locked" : ""}`}
              src={achievement.icon}
              alt={achievement.displayName}
              loading="lazy"
              onClick={() => handleImageClick(achievement)}
              style={{ cursor: achievement.unlocked ? "pointer" : "default" }}
            />

            <div className="achievements__item-content">
              <h4 className="achievements__item-title">
                {achievement.hidden && (
                  <EyeClosedIcon
                    size={13}
                    className="achievements__item-hidden-icon"
                  />
                )}
                {achievement.displayName}
              </h4>
              <p>{getAchievementDescription(achievement)}</p>
            </div>

            <div className="achievements__item-meta">
              {achievement.points != undefined && (
                <div
                  className="achievements__item-points"
                  title={t("achievement_points", { points: achievement.points })}
                >
                  <HydraIcon className="achievements__item-points-icon" />
                  <span className="achievements__item-points-value">
                    {achievement.points}
                  </span>
                </div>
              )}
              {achievement.unlockTime != null && (
                <div
                  className="achievements__item-unlock-time"
                  title={t("unlocked_at", {
                    date: formatDateTime(achievement.unlockTime),
                  })}
                >
                  <small>{formatDateTime(achievement.unlockTime)}</small>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
