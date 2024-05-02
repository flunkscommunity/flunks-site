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

  const themeSelectOptions = Object.keys(index).map((key, i) => ({
    value: i.toString(),
    label: key,
  }));

  const [activeTab, setActiveTab] = useState(0);

  const debouncedSetBackgroundStyle = debounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      setBackgroundColor(e.target.value);
    },
    100
  );

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="User Settings"
      windowsId={WINDOW_IDS.SETTINGS}
      authGuard={true}
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
      </Tabs>
      <TabBody className="!h-full overflow-auto">
        {activeTab === 0 && (
          <div className="flex flex-col gap-2 items-start">
            <div className="mx-auto ">
              <Monitor
                backgroundStyles={{
                  backgroundColor,
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundBlendMode: "overlay",
                  imageRendering: "pixelated",
                }}
              />
            </div>
            <GroupBox
              label={"Background"}
              className="flex items-center gap-4 w-full flex-col"
            >
              <div className="w-full flex gap-2 flex-col lg:flex-row">
                <TextInput
                  value={backgroundUrl}
                  placeholder="Enter background URL"
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  fullWidth
                />
                <div className="flex gap-1 items-center">
                  <Button
                    onClick={() => {
                      setBackgroundImage(backgroundUrl);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setBackgroundImage("");
                      setBackgroundUrl("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="ml-auto">
                <span>Color Overlay: </span>
                <ColorInput
                  onChange={debouncedSetBackgroundStyle}
                  defaultValue={backgroundColor}
                />
              </div>
            </GroupBox>
            {/* <GroupBox
              label={"Vintage"}
              className="flex items-center gap-4 w-full flex-col"
            >
              
            </GroupBox> */}
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
                defaultValue={Object.keys(index).indexOf(theme.name).toString()}
                options={themeSelectOptions}
                width={160}
                onChange={(e) => {
                  const selectedTheme = index[e.label];
                  setTheme({
                    name: e.label as keyof typeof index,
                    theme: selectedTheme,
                  });
                }}
                className="[&>div&>select]:!bg-red-500"
              />
            </GroupBox>
          </div>
        )}
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
