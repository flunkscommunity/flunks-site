import React from "react";
import {
  Button,
  Frame,
  Separator,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import styled from "styled-components";

interface TimelineNode {
  date: string;
  content: React.ReactNode;
}

interface TimelineProps {
  nodes: TimelineNode[];
}

const TimelineLine = styled.div`
  background-color: ${({ theme }) => theme.canvas};
`;

const TimelineNode = ({
  children,
  title,
  side,
}: {
  children: React.ReactNode;
  title: string;
  side: "l" | "r";
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Window
      className={`window w-full lg:w-[49%] h-auto bg-red-500 static transition-all z-10 ${
        side === "l" ? "mr-auto" : "ml-auto"
      }`}
    >
      <WindowHeader className="window-title flex items-center justify-between">
        <span className="text-xl">{title}</span>
        <Button onClick={handleExpand}>{expanded ? "🔼" : "🔽"}</Button>
      </WindowHeader>
      <WindowContent className="!p-0 !pt-1">
        <Frame
          variant="field"
          className="w-full h-full px-3 py-4 text-2xl flex flex-col gap-4"
          style={{
            display: expanded ? "flex" : "none",
          }}
        >
          {children}
        </Frame>
      </WindowContent>
    </Window>
  );
};

const Timeline: React.FC<TimelineProps> = ({ nodes }) => {
  return (
    <div className="relative w-full flex flex-col gap-20 items-center justify-center py-4 pt-20">

      <TimelineNode title="The Creation" side="l">
        <p className="text-lg md:text-xl text-pretty">
          A group of web3 enthusiasts came together to add flavor to the FLOW
          ecosystem. There was a lack of a fun and engaging community-driven
          project on the FLOW blockchain.
        </p>

        <p className="text-lg md:text-xl text-pretty">
          The co-founding team began brainstorming, creating the art and
          direction of the project. The first leak of the project was released
          on Twitter, and the community exploded with excitement.
        </p>

        <p className="text-lg md:text-xl text-pretty">
          After much back and forth, a community vote was held to decide the
          name of the project. The community decided to name the project Flunks
          and thus, Flunks was born.
        </p>
      </TimelineNode>
      {/* <Window className="window w-full lg:w-[49%] h-auto bg-red-500 mr-auto static z-10">
        <WindowHeader className="window-title flex items-center justify-between">
          <span className="text-xl">The Creation</span>
          <span className="text-xl">🗓️ 12.2021</span>
        </WindowHeader>
        <WindowContent className="!p-0 !pt-1">
          <Frame
            variant="field"
            className="w-full h-full px-3 py-4 text-2xl !flex flex-col gap-4"
          >
            
          </Frame>
        </WindowContent>
      </Window> */}

      <Window className="window w-full lg:w-[49%] h-auto bg-red-500 ml-auto static z-10">
        <WindowHeader className="window-title">
          <span className="text-xl">🗓️ 09.21 The Creation</span>
        </WindowHeader>
        <WindowContent className="!p-1">
          <Frame variant="field" className="w-full h-full p-4 text-2xl">
            <p className="text-lg md:text-xl text-pretty">Each Flunk</p>
          </Frame>
        </WindowContent>
      </Window>
    </div>
  );
};

export default Timeline;
