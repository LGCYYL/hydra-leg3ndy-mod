import { useDate } from "@renderer/hooks";
import type { UserAchievement } from "@types";
import { useTranslation } from "react-i18next";
import "./achievements.scss";

interface AchievementListProps {
  achievements: UserAchievement[];
}

export function AchievementList({
  achievements,
}: Readonly<AchievementListProps>) {
  const { t } = useTranslation("achievement");
  const { formatDateTime } = useDate();

  return (
    <ul className="achievements__list">
      {achievements.map((achievement) => (
        <li key={achievement.name} className="achievements__item">
          <img
            className={`achievements__item-image ${!achievement.unlocked ? "achievements__item-image--locked" : ""}`}
            src={achievement.icon}
            alt={achievement.displayName}
            loading="lazy"
          />

          <div className="achievements__item-content">
            <h4 className="achievements__item-title">
              {/* Hidden icon removed */}
              {achievement.displayName}
            </h4>
            <p>{achievement.description}</p>
          </div>

          <div className="achievements__item-meta">
            {/* Points display removed */}
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
  );
}
