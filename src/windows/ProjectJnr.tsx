import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Anchor, Frame, MenuList, MenuListItem, ScrollView } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import JnrCanvas from "components/Canvases/JnrCanvas";
import Marquee from "react-fast-marquee";
import styled from "styled-components";

const FrameWithBackground = styled(Frame)`
  background-image: linear-gradient(
      ${({ theme }) => theme.borderLightest} 1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => theme.borderLightest} 1px,
      ${({ theme }) => theme.material} 1px
    );
  background-size: 20px 20px;
`;

const ProjectJnr: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Project J.N.R"
      onClose={() => {
        closeWindow(WINDOW_IDS.PROJECT_JNR);
      }}
      windowsId={WINDOW_IDS.PROJECT_JNR}
      initialHeight="100%"
      initialWidth="100%"
      showMaximizeButton={false}
      resizable={false}
    >
      <FrameWithBackground variant="field" className="!w-full !h-full relative">
        <div className="absolute inset-0 z-0 flex flex-col justify-end opacity-100 mix-blend-overlay">
          <Marquee autoFill>
            <span className="ml-4 text-6xl">- PREVIEW ONLY - TOP SECRET</span>
          </Marquee>
        </div>
        <JnrCanvas />
      </FrameWithBackground>
    </DraggableResizeableWindow>
  );
};

export default ProjectJnr;
