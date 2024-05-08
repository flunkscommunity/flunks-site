import { AppBar, Frame, MenuListItem, Toolbar } from "react95";
import styled from "styled-components";
import StartButton from "./StartButton";
import QuickMenu from "./QuickMenu";
import AppWindows from "./AppWindows";

const CustomMenuListItem = styled(MenuListItem)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  position: relative;
`;

const Appbar = () => {
  return (
    <AppBar
      position={"absolute"}
      style={{
        zIndex: 1000,
        top: "100%",
        transform: "translateY(-100%)",
      }}
    >
      <Toolbar
        style={{
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div className="flex items-center flex-grow-0 w-full max-w-full">
          <StartButton />
          <div className="max-w-auto overflow-hidden flex mr-1">
            <AppWindows />
          </div>
        </div>
        <QuickMenu />
      </Toolbar>
    </AppBar>
  );
};

export default Appbar;
