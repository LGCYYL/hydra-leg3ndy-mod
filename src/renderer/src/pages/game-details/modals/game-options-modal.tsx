import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, CheckboxField } from "@renderer/components";
import type {
  CreateSteamShortcutOptions,
  Game,
  LibraryGame,
  ProtonVersion,
  ShortcutLocation,
} from "@types";
import { gameDetailsContext } from "@renderer/context";
import { DeleteGameModal } from "@renderer/pages/downloads/delete-game-modal";
import {
  useAppSelector,
  useDownload,
  useGameCollections,
  useLibrary,
  useToast,
  useUserDetails,
} from "@renderer/hooks";
import { RemoveGameFromLibraryModal } from "./remove-from-library-modal";
import { ChangeGamePlaytimeModal } from "./change-game-playtime-modal";
import { ResetAchievementsModal } from "./reset-achievements-modal";
import {
  AlertIcon,
  CloudIcon,
  DownloadIcon,
  GearIcon,
  ImageIcon,
} from "@primer/octicons-react";
import { Wrench } from "lucide-react";
import { GameAssetsSettings } from "./game-assets-settings";
import { debounce } from "lodash-es";
import { levelDBService } from "@renderer/services/leveldb.service";
import { getGameKey } from "@renderer/helpers";
import "./game-options-modal.scss";
import { logger } from "@renderer/logger";
import { GameOptionsSidebar } from "./game-options-modal/sidebar";
import { GeneralSettingsSection } from "./game-options-modal/general-section";
import { CompatibilitySettingsSection } from "./game-options-modal/compatibility-section";
import { DownloadsSettingsSection } from "./game-options-modal/downloads-section";
import { DangerZoneSection } from "./game-options-modal/danger-zone-section";
import type { GameSettingsCategoryId } from "./game-options-modal/types";
import { CreateSteamShortcutModal } from "./create-steam-shortcut-modal";

export interface GameOptionsModalProps {
  visible: boolean;
  game: LibraryGame;
  onClose: () => void;
  onNavigateHome?: () => void;
  initialCategory?: GameSettingsCategoryId;
}

export function GameOptionsModal({
  visible,
  game,
  onClose,
  onNavigateHome,
  initialCategory,
}: Readonly<GameOptionsModalProps>) {
  const MANGOHUD_SITE_URL = "https://mangohud.com";
  const GAMEMODE_SITE_URL = "https://github.com/FeralInteractive/gamemode";
  const { t } = useTranslation("game_details");

  const { showSuccessToast, showErrorToast } = useToast();
  const { updateLibrary } = useLibrary();
  const { loadCollections } = useGameCollections();

  const {
    updateGame,
    setShowRepacksModal,
    repacks,
    selectGameExecutable,
    achievements,
    shopDetails,
  } = useContext(gameDetailsContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveGameModal, setShowRemoveGameModal] = useState(false);
  const [gameTitle, setGameTitle] = useState(game.title ?? "");
  const [updatingGameTitle, setUpdatingGameTitle] = useState(false);
  const [launchOptions, setLaunchOptions] = useState(game.launchOptions ?? "");


  const [creatingSteamShortcut, setCreatingSteamShortcut] = useState(false);
  const [showChangePlaytimeModal, setShowChangePlaytimeModal] = useState(false);
  const [showResetAchievementsModal, setShowResetAchievementsModal] = useState(false);

  const [isBackingUpLocal, setIsBackingUpLocal] = useState(false);
  const [isRestoringLocal, setIsRestoringLocal] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);
  const [autoBackupLocal, setAutoBackupLocal] = useState(game.automaticCloudSync ?? false);
  const [saveFolderPath] = useState<string | null>(null);
  const [loadingSaveFolder] = useState(false);
  const [isDeletingAchievements] = useState(false);
  const hasAchievements = (achievements ?? []).length > 0;

  const [protonVersions, setProtonVersions] = useState<ProtonVersion[]>([]);
  const [selectedProtonPath, setSelectedProtonPath] = useState(
    game.protonPath ?? ""
  );
  const [autoRunMangohud, setAutoRunMangohud] = useState<boolean>(
    game.autoRunMangohud === true
  );
  const [autoRunGamemode, setAutoRunGamemode] = useState<boolean>(
    game.autoRunGamemode === true
  );
  const [gamemodeAvailable, setGamemodeAvailable] = useState(false);
  const [mangohudAvailable, setMangohudAvailable] = useState(false);
  const [winetricksAvailable, setWinetricksAvailable] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<any>("general"); // Set ANY since GameSettingsCategoryId is not imported
  const [defaultWinePrefixPath, setDefaultWinePrefixPath] = useState<
    string | null
  >(null);
  const [showSteamShortcutModal, setShowSteamShortcutModal] = useState(false);
  const [steamShortcutExists, setSteamShortcutExists] = useState(false);

  const {
    removeGameInstaller,
    removeGameFromLibrary,
    isGameDeleting,
    cancelDownload,
  } = useDownload();

  const { userDetails } = useUserDetails();
  const userPreferences = useAppSelector(
    (state) => state.userPreferences.value
  );

  const globalAutoRunGamemode = userPreferences?.autoRunGamemode === true;
  const globalAutoRunMangohud = userPreferences?.autoRunMangohud === true;


  const deleting = isGameDeleting(game.id);

  const { lastPacket } = useDownload();

  const isGameDownloading =
    game.download?.status === "active" && lastPacket?.gameId === game.id;

  const [, setIsScanning] = useState(false);

  // Validate executable exists when modal opens
  useEffect(() => {
    const validateExecutable = async () => {
      if (visible && game.executablePath) {
        const exists = await window.electron.checkFileExists(game.executablePath);
        if (!exists) {
          // File doesn't exist, clear the path and re-scan
          await window.electron.updateExecutablePath(game.shop, game.objectId, null);
          updateGame();
        }
      }
    };
    validateExecutable();
  }, [visible, game.executablePath, game.shop, game.objectId, updateGame]);

  useEffect(() => {
    if (visible && !game.executablePath && game.download?.downloadPath) {
      setIsScanning(true);
      window.electron
        .scanForExecutable(game.shop, game.objectId)
        .finally(() => {
          setIsScanning(false);
          updateGame();
        });
    }
  }, [visible, game.executablePath, game.download?.downloadPath, game.shop, game.objectId, updateGame]);



  useEffect(() => {
    setGameTitle(game.title ?? "");
  }, [game.title]);

  useEffect(() => {
    setSelectedProtonPath(game.protonPath ?? "");
  }, [game.protonPath]);

  useEffect(() => {
    setAutoRunMangohud(game.autoRunMangohud === true);
  }, [game.autoRunMangohud]);

  useEffect(() => {
    setAutoRunGamemode(game.autoRunGamemode === true);
  }, [game.autoRunGamemode]);

  useEffect(() => {
    if (!visible || window.electron.platform !== "linux") return;

    window.electron
      .getInstalledProtonVersions()
      .then(setProtonVersions)
      .catch(() => setProtonVersions([]));
  }, [visible]);

  useEffect(() => {
    if (!visible || window.electron.platform !== "linux") {
      setDefaultWinePrefixPath(null);
      return;
    }

    window.electron
      .getDefaultWinePrefixSelectionPath()
      .then((defaultPath) => setDefaultWinePrefixPath(defaultPath))
      .catch(() => setDefaultWinePrefixPath(null));
  }, [visible]);

  useEffect(() => {
    if (!visible || window.electron.platform !== "linux") {
      setGamemodeAvailable(false);
      return;
    }

    window.electron
      .isGamemodeAvailable()
      .then(setGamemodeAvailable)
      .catch(() => setGamemodeAvailable(false));
  }, [visible]);

  useEffect(() => {
    if (!visible || window.electron.platform !== "linux") {
      setMangohudAvailable(false);
      return;
    }

    window.electron
      .isMangohudAvailable()
      .then(setMangohudAvailable)
      .catch(() => setMangohudAvailable(false));
  }, [visible]);

  useEffect(() => {
    if (!visible || window.electron.platform !== "linux") {
      setWinetricksAvailable(false);
      return;
    }

    window.electron
      .isWinetricksAvailable()
      .then(setWinetricksAvailable)
      .catch(() => setWinetricksAvailable(false));
  }, [visible]);

  useEffect(() => {
    if (game.shop !== "custom") {
      console.log(
        "Checking Steam shortcut existence for",
        window.electron.checkSteamShortcut(game.shop, game.objectId)
      );
      window.electron
        .checkSteamShortcut(game.shop, game.objectId)
        .then(setSteamShortcutExists)
        .catch(() => setSteamShortcutExists(false));
    }
  }, [game.shop, game.objectId]);

  const debounceUpdateLaunchOptions = useRef(
    debounce(async (value: string) => {
      const gameKey = getGameKey(game.shop, game.objectId);
      const gameData = (await levelDBService.get(
        gameKey,
        "games"
      )) as Game | null;
      if (gameData) {
        const trimmedValue = value.trim();
        const updated = {
          ...gameData,
          launchOptions: trimmedValue ? trimmedValue : null,
        };
        await levelDBService.put(gameKey, updated, "games");
      }
      updateGame();
    }, 1000)
  ).current;

  const handleRemoveGameFromLibrary = async () => {
    if (isGameDownloading) {
      await cancelDownload(game.shop, game.objectId);
    }

    await removeGameFromLibrary(game.shop, game.objectId);
    await Promise.all([updateGame(), updateLibrary(), loadCollections()]);
    onClose();

    // Redirect to home page if it's a custom game
    if (game.shop === "custom" && onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleChangeExecutableLocation = async () => {
    const path = await selectGameExecutable();

    if (path) {
      const gameUsingPath =
        await window.electron.verifyExecutablePathInUse(path);

      if (gameUsingPath) {
        showErrorToast(
          t("executable_path_in_use", { game: gameUsingPath.title })
        );
        return;
      }

      window.electron
        .updateExecutablePath(game.shop, game.objectId, path)
        .then(updateGame);
    }
  };

  const handleCreateSteamShortcut = async (
    options?: CreateSteamShortcutOptions
  ) => {
    try {
      setCreatingSteamShortcut(true);

      await window.electron.createSteamShortcut(
        game.shop,
        game.objectId,
        options ?? {}
      );

      showSuccessToast(
        t("create_shortcut_success"),
        t("you_might_need_to_restart_steam")
      );

      const exists = await window.electron.checkSteamShortcut(
        game.shop,
        game.objectId
      );
      setSteamShortcutExists(exists);

      updateGame();
    } catch (error: unknown) {
      logger.error("Failed to create Steam shortcut", error);
      showErrorToast(t("create_shortcut_error"));
    } finally {
      setCreatingSteamShortcut(false);
      setShowSteamShortcutModal(false);
    }
  };

  const handleDeleteSteamShortcut = async () => {
    try {
      setCreatingSteamShortcut(true);
      await window.electron.deleteSteamShortcut(game.shop, game.objectId);

      showSuccessToast(
        t("delete_shortcut_success"),
        t("you_might_need_to_restart_steam")
      );

      const exists = await window.electron.checkSteamShortcut(
        game.shop,
        game.objectId
      );
      setSteamShortcutExists(exists);

      updateGame();
    } catch (error: unknown) {
      logger.error("Failed to delete Steam shortcut", error);
      showErrorToast(t("delete_shortcut_error"));
    } finally {
      setCreatingSteamShortcut(false);
    }
  };

  const handleCreateShortcut = async (location: ShortcutLocation) => {
    window.electron
      .createGameShortcut(game.shop, game.objectId, location)
      .then((success) => {
        if (success) {
          showSuccessToast(t("create_shortcut_success"));
        } else {
          showErrorToast(t("create_shortcut_error"));
        }
      })
      .catch(() => {
        showErrorToast(t("create_shortcut_error"));
      });
  };

  const handleOpenDownloadFolder = async () => {
    await window.electron.openGameInstallerPath(game.shop, game.objectId);
  };

  const handleDeleteGame = async () => {
    await removeGameInstaller(game.shop, game.objectId);
    updateGame();
  };

  const handleOpenGameExecutablePath = async () => {
    await window.electron.openGameExecutablePath(game.shop, game.objectId);
  };

  const handleOpenSaveFolder = async () => {
    if (saveFolderPath) {
      // Best guess for the original electron API binding:
      try {
        await window.electron.showItemInFolder(saveFolderPath);
      } catch {
        // Fallback or do nothing
      }
    }
  };

  const handleClearExecutablePath = async () => {
    await window.electron.updateExecutablePath(game.shop, game.objectId, null);

    updateGame();
  };

  const handleChangeWinePrefixPath = async () => {
    const defaultPath =
      await window.electron.getDefaultWinePrefixSelectionPath();

    const { filePaths } = await window.electron.showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: game?.winePrefixPath ?? defaultPath ?? "",
    });

    if (filePaths && filePaths.length > 0) {
      try {
        await window.electron.selectGameWinePrefix(
          game.shop,
          game.objectId,
          filePaths[0]
        );
        await updateGame();
      } catch (error) {
        showErrorToast(
          t("invalid_wine_prefix_path"),
          t("invalid_wine_prefix_path_description")
        );
      }
    }
  };

  const handleClearWinePrefixPath = async () => {
    await window.electron.selectGameWinePrefix(game.shop, game.objectId, null);
    updateGame();
  };

  const handleOpenWinetricks = async () => {
    const success = await window.electron.openGameWinetricks(
      game.shop,
      game.objectId
    );

    if (success) {
      showSuccessToast(t("winetricks_opened"));
    } else {
      showErrorToast(t("winetricks_open_error"));
    }
  };

  const handleChangeMangohudState = async (value: boolean) => {
    setAutoRunMangohud(value);
    await window.electron.toggleGameMangohud(game.shop, game.objectId, value);
    updateGame();
  };

  const handleChangeGamemodeState = async (value: boolean) => {
    setAutoRunGamemode(value);
    await window.electron.toggleGameGamemode(game.shop, game.objectId, value);
    updateGame();
  };

  const applyProtonPathChange = async (protonPath: string) => {
    try {
      await window.electron.selectGameProtonPath(
        game.shop,
        game.objectId,
        protonPath || null
      );
      await updateGame();
    } catch {
      setSelectedProtonPath(game.protonPath ?? "");
      showErrorToast(t("proton_version_update_error"));
    }
  };

  const handleChangeLaunchOptions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setLaunchOptions(value);
    debounceUpdateLaunchOptions(value);
  };

  const handleChangeGameTitle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGameTitle(event.target.value);
  };

  const handleBlurGameTitle = async () => {
    if (updatingGameTitle) return;

    const trimmedTitle = gameTitle.trim();
    const currentTitle = (game.title ?? "").trim();

    if (!trimmedTitle) {
      setGameTitle(game.title ?? "");
      showErrorToast(t("edit_game_modal_fill_required"));
      return;
    }

    if (trimmedTitle === currentTitle) {
      setGameTitle(game.title ?? "");
      return;
    }

    setUpdatingGameTitle(true);

    try {
      if (game.shop === "custom") {
        await window.electron.updateCustomGame({
          shop: game.shop,
          objectId: game.objectId,
          title: trimmedTitle,
          iconUrl: game.iconUrl || undefined,
          logoImageUrl: game.logoImageUrl || undefined,
          libraryHeroImageUrl: game.libraryHeroImageUrl || undefined,
        });
      } else {
        await window.electron.updateGameCustomAssets({
          shop: game.shop,
          objectId: game.objectId,
          title: trimmedTitle,
        });
      }

      await Promise.all([updateGame(), updateLibrary()]);
      setGameTitle(trimmedTitle);
    } catch (error) {
      setGameTitle(game.title ?? "");
      showErrorToast(
        error instanceof Error ? error.message : t("edit_game_modal_failed")
      );
    } finally {
      setUpdatingGameTitle(false);
    }
  };

  const handleChangeProtonVersion = (value: string) => {
    setSelectedProtonPath(value);

    const currentProtonPath = game.protonPath ?? "";
    if (value === currentProtonPath) {
      return;
    }

    void applyProtonPathChange(value);
  };

  const handleClearLaunchOptions = async () => {
    setLaunchOptions("");

    const gameKey = getGameKey(game.shop, game.objectId);
    const gameData = (await levelDBService.get(
      gameKey,
      "games"
    )) as Game | null;
    if (gameData) {
      const updated = { ...gameData, launchOptions: null };
      await levelDBService.put(gameKey, updated, "games");
    }
    updateGame();
  };

  const shouldShowWinePrefixConfiguration =
    window.electron.platform === "linux";
  const defaultHydraWinePrefixPath = defaultWinePrefixPath
    ? `${defaultWinePrefixPath}/${game.objectId}`
    : null;
  const displayedWinePrefixPath =
    game.winePrefixPath ?? defaultHydraWinePrefixPath;

  const categories = useMemo(
    () => [
      {
        id: "general" as const,
        label: t("settings_category_general"),
        icon: <GearIcon size={16} />,
      },
      {
        id: "assets" as const,
        label: t("settings_category_assets"),
        icon: <ImageIcon size={16} />,
      },
      {
        id: "hydra_cloud" as const,
        label: t("settings_category_hydra_cloud"),
        icon: <CloudIcon size={16} />,
      },
      ...(shouldShowWinePrefixConfiguration
        ? [
          {
            id: "compatibility" as const,
            label: t("settings_category_compatibility"),
            icon: <Wrench size={16} />,
          },
        ]
        : []),
      {
        id: "downloads" as const,
        label: t("settings_category_downloads"),
        icon: <DownloadIcon size={16} />,
      },
      {
        id: "danger_zone" as const,
        label: t("settings_category_danger_zone"),
        icon: <AlertIcon size={16} />,
      },
    ],
    [shouldShowWinePrefixConfiguration, t]
  );

  useEffect(() => {
    if (visible) {
      setSelectedCategory(initialCategory ?? "general");
    }
  }, [initialCategory, visible]);

  const shouldShowCreateStartMenuShortcut =
    window.electron.platform === "win32";

  const handleChangePlaytime = async (playtimeInSeconds: number) => {
    try {
      await window.electron.changeGamePlayTime(
        game.shop,
        game.objectId,
        playtimeInSeconds
      );
      await updateGame();
      showSuccessToast(t("update_playtime_success"));
    } catch (error) {
      showErrorToast(t("update_playtime_error"));
    }
  };

  const handleBackupLocalSave = async () => {
    try {
      setIsBackingUpLocal(true);
      await window.electron.saveLocalBackup(game.objectId, game.shop, "Manual Backup");
      showSuccessToast(t("backup_local_save_success"));
      updateGame();
    } catch (err) {
      showErrorToast(t("backup_local_save_error"));
    } finally {
      setIsBackingUpLocal(false);
    }
  };

  const handleRestoreLocalSave = async () => {
    if (!game.localSaveArtifacts?.length) return;

    // For simplicity, just restore the most recent one
    const artifact = game.localSaveArtifacts[game.localSaveArtifacts.length - 1];

    try {
      setIsRestoringLocal(true);
      await window.electron.restoreLocalBackup(game.objectId, game.shop, artifact.id);
      showSuccessToast(t("restore_local_save_success"));
    } catch (err) {
      showErrorToast(t("restore_local_save_error"));
    } finally {
      setIsRestoringLocal(false);
    }
  };

  const handleDeleteLocalSave = async () => {
    if (!game.localSaveArtifacts?.length) return;

    // For simplicity, just delete the most recent one
    const artifact = game.localSaveArtifacts[game.localSaveArtifacts.length - 1];

    try {
      setIsDeletingLocal(true);
      await window.electron.deleteLocalBackup(game.objectId, game.shop, artifact.id);
      showSuccessToast(t("delete_local_save_success"));
      updateGame();
    } catch (err) {
      showErrorToast(t("delete_local_save_error"));
    } finally {
      setIsDeletingLocal(false);
    }
  };

  const handleToggleAutoBackup = async () => {
    const newValue = !autoBackupLocal;
    setAutoBackupLocal(newValue);

    const gameKey = getGameKey(game.shop, game.objectId);
    const gameData = (await levelDBService.get(gameKey, "games")) as Game | null;
    if (gameData) {
      await levelDBService.put(
        gameKey,
        { ...gameData, automaticCloudSync: newValue },
        "games"
      );
      updateGame();
    }
  };



  return (
    <>
      <DeleteGameModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        deleteGame={handleDeleteGame}
      />

      <RemoveGameFromLibraryModal
        visible={showRemoveGameModal}
        onClose={() => setShowRemoveGameModal(false)}
        removeGameFromLibrary={handleRemoveGameFromLibrary}
        game={game}
      />



      <ChangeGamePlaytimeModal
        visible={showChangePlaytimeModal}
        onClose={() => setShowChangePlaytimeModal(false)}
        changePlaytime={handleChangePlaytime}
        game={game}
      />

      <ResetAchievementsModal
        visible={showResetAchievementsModal}
        onClose={() => setShowResetAchievementsModal(false)}
        resetAchievements={() => window.electron.resetGameAchievements(game.shop, game.objectId)}
        game={game}
      />

      <CreateSteamShortcutModal
        visible={showSteamShortcutModal}
        creating={creatingSteamShortcut}
        onClose={() => setShowSteamShortcutModal(false)}
        onConfirm={handleCreateSteamShortcut}
      />

      <Modal
        visible={visible}
        title={game.title}
        onClose={onClose}
        large={true}
        noContentPadding
      >
        <div className="game-options-modal__container">
          <GameOptionsSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="game-options-modal__panel">
            {selectedCategory === "general" && (
              <GeneralSettingsSection
                game={game}
                gameTitle={gameTitle}
                launchOptions={launchOptions}
                updatingGameTitle={updatingGameTitle}
                creatingSteamShortcut={creatingSteamShortcut}
                shouldShowCreateStartMenuShortcut={
                  shouldShowCreateStartMenuShortcut
                }
                shouldShowWinePrefixConfiguration={
                  shouldShowWinePrefixConfiguration
                }
                loadingSaveFolder={loadingSaveFolder}
                saveFolderPath={saveFolderPath}
                steamShortcutExists={steamShortcutExists}
                onChangeExecutableLocation={handleChangeExecutableLocation}
                onClearExecutablePath={handleClearExecutablePath}
                onOpenGameExecutablePath={handleOpenGameExecutablePath}
                onOpenSaveFolder={handleOpenSaveFolder}
                onCreateShortcut={handleCreateShortcut}
                onCreateSteamShortcut={() => setShowSteamShortcutModal(true)}
                onDeleteSteamShortcut={handleDeleteSteamShortcut}
                onChangeGameTitle={handleChangeGameTitle}
                onBlurGameTitle={handleBlurGameTitle}
                onChangeLaunchOptions={handleChangeLaunchOptions}
                onClearLaunchOptions={handleClearLaunchOptions}
              />
            )}

            {selectedCategory === "assets" && (
              <GameAssetsSettings
                game={game}
                shopDetails={shopDetails}
                onGameUpdated={updateGame}
              />
            )}

            {selectedCategory === "hydra_cloud" && (
              <div className="game-options-modal__section">
                <div className="game-options-modal__header">
                  <h2>{t("local_saves_backup")}</h2>
                  <h4 className="game-options-modal__header-description">
                    {t("local_saves_description")}
                  </h4>
                </div>

                <div className="game-options-modal__row">
                  <Button
                    onClick={handleBackupLocalSave}
                    theme="outline"
                    disabled={isBackingUpLocal}
                  >
                    {t("backup_local_save")}
                  </Button>

                  <Button
                    onClick={handleRestoreLocalSave}
                    theme="outline"
                    disabled={isRestoringLocal || !game.localSaveArtifacts?.length}
                  >
                    {t("restore_local_save")}
                  </Button>

                  <Button
                    onClick={handleDeleteLocalSave}
                    theme="outline"
                    disabled={isDeletingLocal || !game.localSaveArtifacts?.length}
                  >
                    {t("delete_local_save")}
                  </Button>
                </div>

                <div style={{ marginTop: 16 }}>
                  {game.localSaveArtifacts && game.localSaveArtifacts.length > 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>
                      {t("local_backup_date", {
                        date: new Date(game.localSaveArtifacts[game.localSaveArtifacts.length - 1].createdAt).toLocaleString()
                      })}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>
                      {t("no_local_backup_found")}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <CheckboxField
                    label={t("auto_backup_local")}
                    checked={autoBackupLocal}
                    onChange={handleToggleAutoBackup}
                  />
                </div>
              </div>
            )}

            {selectedCategory === "compatibility" &&
              shouldShowWinePrefixConfiguration && (
                <CompatibilitySettingsSection
                  game={game}
                  displayedWinePrefixPath={displayedWinePrefixPath}
                  protonVersions={protonVersions}
                  selectedProtonPath={selectedProtonPath}
                  autoRunGamemode={autoRunGamemode}
                  autoRunMangohud={autoRunMangohud}
                  globalAutoRunGamemode={globalAutoRunGamemode}
                  globalAutoRunMangohud={globalAutoRunMangohud}
                  gamemodeAvailable={gamemodeAvailable}
                  mangohudAvailable={mangohudAvailable}
                  winetricksAvailable={winetricksAvailable}
                  gamemodeSiteUrl={GAMEMODE_SITE_URL}
                  mangohudSiteUrl={MANGOHUD_SITE_URL}
                  onChangeWinePrefixPath={handleChangeWinePrefixPath}
                  onClearWinePrefixPath={handleClearWinePrefixPath}
                  onOpenWinetricks={handleOpenWinetricks}
                  onChangeGamemodeState={handleChangeGamemodeState}
                  onChangeMangohudState={handleChangeMangohudState}
                  onChangeProtonVersion={handleChangeProtonVersion}
                />
              )}

            {selectedCategory === "downloads" && (
              <DownloadsSettingsSection
                game={game}
                deleting={deleting}
                isGameDownloading={isGameDownloading}
                repacksLength={repacks.length}
                onOpenRepacks={() => setShowRepacksModal(true)}
                onOpenDownloadFolder={handleOpenDownloadFolder}
              />
            )}

            {selectedCategory === "danger_zone" && (
              <DangerZoneSection
                game={game}
                deleting={deleting}
                isDeletingAchievements={isDeletingAchievements}
                hasAchievements={hasAchievements}
                isGameDownloading={isGameDownloading}
                userDetails={userDetails}
                onOpenRemoveFromLibrary={() => setShowRemoveGameModal(true)}
                onOpenResetAchievements={() =>
                  setShowResetAchievementsModal(true)
                }
                onOpenChangePlaytime={() => setShowChangePlaytimeModal(true)}
                onOpenRemoveFiles={() => setShowDeleteModal(true)}
              />
            )}
          </div>
        </div>
      </Modal >
    </>
  );
}
