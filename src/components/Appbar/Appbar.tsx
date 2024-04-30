import { AppBar, MenuListItem, Toolbar } from "react95";
import styled from "styled-components";
import StartButton from "./StartButton";

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
        style={{ justifyContent: "space-between", position: "relative" }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <StartButton />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Appbar;
