import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Button,
  Checkbox,
  ColorInput,
  GroupBox,
  Monitor,
  SelectNative,
  Tab,
  TabBody,
  Tabs,
} from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import UserInformation from "components/Settings/UserInformation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ChangeEvent, useState } from "react";
import useThemeSettings from "store/useThemeSettings";
import styled from "styled-components";
import debounce from "lodash/debounce";
import index from "react95/dist/themes/index";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";

const AVOIDED_THEMES = [
  "aiee",
  "solarizedLight",
  "solarizedDark",
  "blackAndWhite",
  "toner",
  "windows1",
  "highContrast",
  "hotdogStand",
  "white",
  "polarized",
  "powerShell",
  "seawater",
  "violetDark",
  "vistaesqueMidnight",
  "modernDark",
];

const Settings: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { setShowDynamicUserProfile } = useDynamicContext();
  const {
    desktopBackground,
    desktopBackgroundType,
    setDesktopBackground,
    setDesktopBackgroundType,
    oldMonitorMode,
    setOldMonitorMode,
    theme,
    setTheme,
  } = useThemeSettings();

  const themeSelectOptions = Object.keys(index)
    .map((key, i) => ({
      value: i.toString(),
      label: key,
    }))
    .filter((option) => !AVOIDED_THEMES.includes(option.label));

  const backgroundSelectOptions = [
    {
      label: "My Background",
      url: "/images/my-background.png",
    },
    {
      label: "Flunks 95 Startup",
      url: "https://storage.googleapis.com/flunks_public/desktop-backgrounds/bootup.webp",
    },
    {
      label: "Blue Sky",
      url: "/images/backdrops/BLUE-SKY.png",
    },
    {
      label: "Night Time",
      url: "/images/backdrops/NIGHT-TIME.png",
    },
    {
      label: "Very Dapper",
      url: "/images/backdrops/VERY-DAPPER.png",
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  const debouncedSetBackgroundStyle = debounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      setDesktopBackground(`background-color: ${e.target.value};`);
      setDesktopBackgroundType('pattern'); // Use pattern type for solid colors
    },
    100
  );

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Settings"
      windowsId={WINDOW_IDS.SETTINGS}
      authGuard={false}
      onClose={() => {
        closeWindow(WINDOW_IDS.SETTINGS);
      }}
      showMaximizeButton={false}
      initialHeight="auto"
      initialWidth="auto"
      
      headerIcon="/images/icons/settings.png"
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value={0}>Desktop</Tab>
        <Tab value={1}>System</Tab>
        <Tab value={2}>User</Tab>
      </Tabs>
      <TabBody className="!h-full overflow-auto">
        <CustomScrollArea>
          {activeTab === 0 && (
            <div className="flex flex-col gap-4 items-start max-w-[600px] mx-auto">
              
              {/* Desktop Background Section */}
              <div className="w-full">
                <div className="mx-auto mb-4">
                  <Monitor
                    backgroundStyles={{
                      ...(desktopBackgroundType === 'image' ? {
                        backgroundImage: `url(${desktopBackground})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      } : {
                        background: desktopBackgroundType === 'pattern' || desktopBackgroundType === 'gradient' ? 
                          desktopBackground.replace(/background:/g, '').replace(/;/g, '') : 
                          undefined
                      }),
                      imageRendering: "crisp-edges",
                    }}
                  />
                </div>
                <GroupBox
                  label={"Desktop Background"}
                  className="flex items-center gap-4 w-full flex-col"
                >
                  <div className="flex flex-col w-full h-full flex-grow-0">
                    <div className="mb-4">
                      <span className="text-sm font-bold mb-2 block">Images</span>
                      <CustomStyledScrollView>
                        <CustomScrollArea className="flex flex-row gap-2 ">
                          {backgroundSelectOptions.map((option) => (
                            <Button
                              key={option.url}
                              onClick={() => {
                                setDesktopBackground(option.url);
                                setDesktopBackgroundType('image');
                              }}
                              active={desktopBackground === option.url && desktopBackgroundType === 'image'}
                              className="!h-full !p-1 flex-shrink-0"
                            >
                              <img
                                src={option.url}
                                alt="background"
                                className="w-[124px] aspect-video"
                              />
                            </Button>
                          ))}
                        </CustomScrollArea>
                      </CustomStyledScrollView>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center w-full justify-between">
                    <div className="flex flex-col items-start ">
                      <span className="text-lg font-black">Background Color</span>
                      <span className="text-sm">Replaces current background</span>
                    </div>
                    <ColorInput
                      onChange={debouncedSetBackgroundStyle}
                      defaultValue="#C0C0C0"
                    />
                  </div>
                </GroupBox>
              </div>
            </div>
          )}
          {activeTab === 1 && (
            <div className="flex flex-col gap-4">
              <GroupBox
                label={"Vintage Settings"}
                className="flex gap-4 w-full flex-col"
              >
                <Checkbox
                  checked={oldMonitorMode}
                  onChange={() => setOldMonitorMode(!oldMonitorMode)}
                  label="Old Monitor Effect"
                />
              </GroupBox>
              <GroupBox
                label={"Theme Settings"}
                className="flex gap-4 w-full flex-col"
              >
                <SelectNative
                  defaultValue={Object.keys(index)
                    .indexOf(theme.name)
                    .toString()}
                  options={themeSelectOptions}
                  width={160}
                  onChange={(e) => {
                    const selectedTheme = index[e.label];
                    setTheme({
                      name: e.label as keyof typeof index,
                      theme: selectedTheme,
                    });
                  }}
                />
              </GroupBox>
            </div>
          )}
          {activeTab === 2 && (
            <div className="flex flex-col gap-4 items-start max-w-[600px] mx-auto">
              <UserInformation />
            </div>
          )}
        </CustomScrollArea>
      </TabBody>
    </DraggableResizeableWindow>
  );
};

export default Settings;
