import styled from "styled-components";
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  border: 1px solid #ffffff80;
`;

const MyPlace = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <AppLoader bgImage="/images/loading/bootup.webp">
      <DraggableResizeableWindow
        windowsId={WINDOW_IDS.MYPLACE}
        onClose={() => closeWindow(WINDOW_IDS.MYPLACE)}
        initialWidth="100%"
        initialHeight="100%"
        headerTitle="MyPlace"
        headerIcon="/images/icons/myplace.png"
        resizable={false}
      >
        <Grid>
          <Cell>freak</Cell>
          <Cell>jock</Cell>
          <Cell>geek</Cell>
          <Cell>prep</Cell>
        </Grid>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default MyPlace;
