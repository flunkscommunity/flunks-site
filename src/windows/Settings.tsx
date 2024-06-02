import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Button,
  Checkbox,
  ColorInput,
  Frame,
  GroupBox,
  Monitor,
  ScrollView,
  Select,
  SelectNative,
  Tab,
  TabBody,
  Tabs,
  TextInput,
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
    backgroundImage,
    backgroundColor,
    setBackgroundColor,
    setBackgroundImage,
    oldMonitorMode,
    setOldMonitorMode,
    theme,
    setTheme,
  } = useThemeSettings();
  const [backgroundUrl, setBackgroundUrl] = useState<string>(backgroundImage);

  const themeSelectOptions = Object.keys(index)
    .map((key, i) => ({
      value: i.toString(),
      label: key,
    }))
    .filter((option) => !AVOIDED_THEMES.includes(option.label));

  const backgroundSelectOptions = [
    {
      label: "Campus Map",
      url: "https://storage.googleapis.com/flunks_public/rebrand/map-poster.jpg",
    },
    {
      label: "Windows XP Flunk",
      url: "https://storage.googleapis.com/flunks_public/desktop-backgrounds/posterized.webp",
    },
    {
      label: "Flunks 95 Setup",
      url: "https://storage.googleapis.com/flunks_public/desktop-backgrounds/flunksbg.webp",
    },
    {
      label: "Flunks 95 Startup",
      url: "https://storage.googleapis.com/flunks_public/desktop-backgrounds/bootup.webp",
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  const debouncedSetBackgroundStyle = debounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      setBackgroundImage("");
      setBackgroundColor(e.target.value);
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
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value={0}>Background</Tab>
        <Tab value={1}>System</Tab>
        <Tab value={2}>User</Tab>
      </Tabs>
      <TabBody className="!h-full overflow-auto">
        <CustomScrollArea>
          {activeTab === 0 && (
            <div className="flex flex-col gap-2 items-start max-w-[600px] mx-auto">
              <div className="mx-auto ">
                <Monitor
                  backgroundStyles={{
                    backgroundColor,
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    imageRendering: "crisp-edges",
                  }}
                />
              </div>
              <GroupBox
                label={"Background"}
                className="flex items-center gap-4 w-full flex-col"
              >
                <div className="flex flex-col w-full h-full flex-grow-0">
                  <CustomStyledScrollView>
                    <CustomScrollArea className="flex flex-row gap-2 ">
                      {backgroundSelectOptions.map((option) => (
                        <Button
                          onClick={() => {
                            setBackgroundImage(option.url);
                          }}
                          active={backgroundImage === option.url}
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

                <div className="flex gap-4 items-center w-full justify-between">
                  <div className="flex flex-col items-start ">
                    <span className="text-lg font-black">Background Color</span>
                    <span className="text-sm">Replaces current background</span>
                  </div>
                  <ColorInput
                    onChange={debouncedSetBackgroundStyle}
                    defaultValue={backgroundColor}
                  />
                </div>
              </GroupBox>
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
            <CustomStyledScrollView className="w-full h-full flex flex-col !p-0">
              <CustomScrollArea>
                <UserInformation />
              </CustomScrollArea>
            </CustomStyledScrollView>
          )}
        </CustomScrollArea>
      </TabBody>
      {/* <div className="flex flex-row justify-end items-center pb-3">
          <Button onClick={() => setShowDynamicUserProfile(true)}>
            Update Settings
          </Button>
        </div> */}
      {/* <Frame
          variant="field"
          className="w-full h-[calc(100%-48px)] !flex !flex-col"
        >
          <ScrollView className="w-full h-full flex flex-col">
            <UserInformation />
          </ScrollView>
        </Frame> */}
    </DraggableResizeableWindow>
  );
};

export default Settings;
