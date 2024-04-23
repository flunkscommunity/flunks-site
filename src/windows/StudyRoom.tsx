import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Tab, TabBody, Tabs } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";

const StudyRoom: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Lost and Found v2.0"
      onClose={() => {
        closeWindow(WINDOW_IDS.STUDY_ROOM);
      }}
    >
      <SlowProgressBar bgImage="/images/lost-and-found-bg.png">
        <Tabs
          value={activeTab}
          onChange={() => {
            setActiveTab(activeTab === 0 ? 1 : 0);
          }}
        >
          <Tab value={0}>Claim Checker</Tab>
          <Tab value={1}>Claim Forms</Tab>
        </Tabs>
        <TabBody>
          {activeTab === 1 && <h1>1</h1>}
          {activeTab === 0 && <h1>2</h1>}
        </TabBody>
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default StudyRoom;
