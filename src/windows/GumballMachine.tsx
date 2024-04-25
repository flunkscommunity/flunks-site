import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Frame,
  MenuList,
  MenuListItem,
  Tab,
  TabBody,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tabs,
  WindowContent,
} from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";
import styled from "styled-components";
import AppLoader from "components/AppLoader";

const CustomTableHeadCell = styled(TableHeadCell)`
  flex: 1 1 0%;
`;
const CustomTableDataCell = styled(TableDataCell)`
  flex: 1 1 0%;
  display: flex;
  items-align: center;
  justify-content: start;
`;

const NftTable = () => {
  return (
    <div className="[&>*:first-child]:!w-full [&>*:first-child]:before:!border-none flex w-full">
      <Table className="!h-full !flex !flex-col !w-full !flex-1">
        <TableHead className="!h-auto !w-full !flex-1">
          <TableRow className="!flex !items-center !w-full">
            <CustomTableHeadCell>Flunk</CustomTableHeadCell>
            <CustomTableHeadCell>Rarity</CustomTableHeadCell>
            <CustomTableHeadCell>Staked</CustomTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="!h-full !flex !flex-col !w-full">
          {new Array(200).fill(0).map(() => (
            <TableRow className="!flex !items-center justify-center !w-full !h-[50px] shadow-sm">
              <CustomTableDataCell className="!items-center !h-full">
                <img
                  src="https://storage.googleapis.com/flunk-graduation/ead17e13e806bfef4486f0502b376a94bb0694f125be95a0a3d03b1cb520c5ed.png"
                  className="h-[90%] object-contain mr-2"
                />
                <span className="hidden lg:block text-sm lg:text-lg leading-[1] mr-1">
                  Flunk
                </span>
                <span className="text-sm lg:text-lg leading-[1]">#6372</span>
              </CustomTableDataCell>
              <CustomTableDataCell>3707</CustomTableDataCell>
              <CustomTableDataCell>No</CustomTableDataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const GumballMachine: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AppLoader bgImage="/images/loading/gumball.webp">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="Gumball Machine v96"
        onClose={() => {
          closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
        }}
      >
        <div className="h-[200px] flex-shrink-0"></div>
        <Frame
          variant="inside"
          className="!flex !h-full !w-full overflow-hidden"
        >
          <NftTable />
        </Frame>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default GumballMachine;
