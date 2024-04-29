import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Button,
  Counter,
  Frame,
  MenuList,
  MenuListItem,
  Separator,
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
import { useEffect, useState } from "react";
import styled from "styled-components";
import AppLoader from "components/AppLoader";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ErrorWindow from "./ErrorWindow";
import {
  getUsersControllerGetUserNftsByWalletAddressKey,
  useUsersControllerGetUserNftsByWalletAddress,
} from "generated/api/users/users";
import { getPendingRewardsAll } from "web3/script-pending-reward-all";
import GumDashboard from "components/Staking/GumDashboard";
import RowItem from "components/Staking/Table/RowItem";

const CustomTableHeadCell = styled(TableHeadCell)`
  flex: 1 0 0%;
`;
const CustomTableDataCell = styled(TableDataCell)`
  flex: 1 0 0%;
  display: flex;
  items-align: center;
  justify-content: center;
`;

const NftTable = () => {
  const { primaryWallet } = useDynamicContext();

  const { data } = useUsersControllerGetUserNftsByWalletAddress(
    primaryWallet.address
  );

  const flunks = data?.data?.Flunks;
  const backpacks = data?.data?.Backpack;

  return (
    <div className="[&>*:first-child]:!w-full [&>*:first-child]:before:!border-none flex w-full">
      <Table className="!h-full !flex !flex-col !w-full !flex-1">
        <TableHead className="!h-auto !w-full !flex-1">
          <TableRow className="!flex !items-center !w-full">
            <CustomTableHeadCell className="flex-grow">
              Item
            </CustomTableHeadCell>
            {/* <CustomTableHeadCell className="flex-grow">Collection</CustomTableHeadCell> */}
            <CustomTableHeadCell className="flex-grow">
              Earned
            </CustomTableHeadCell>
            <CustomTableHeadCell className="flex-grow">
              Earning?
            </CustomTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="!h-full !flex !flex-col !w-full">
          {flunks?.map((flunk) => (
            <RowItem
              prettyCollection="Flunks"
              collectionName={flunk.collectionName}
              image={flunk.metadata.uri ?? flunk.metadata.pixelUri}
              tokenId={flunk.tokenId}
              key={`${flunk.collectionName}-${flunk.tokenId}`}
            />
          ))}
          {backpacks?.map((backpack) => (
            <RowItem
              prettyCollection="Backpack"
              collectionName={backpack.collectionName}
              image={backpack.metadata.uri ?? backpack.metadata.pixelUri}
              tokenId={backpack.tokenId}
              key={`${backpack.collectionName}-${backpack.tokenId}`}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const GumballMachine: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { user } =
    useDynamicContext();

  if (!user) {
    return (
      <ErrorWindow
        title="Error Starting Program"
        message="You're not signed in. Please sign in to continue.."
        actions={
          <>
            <Button onClick={() => closeWindow(WINDOW_IDS.GUMBALL_MACHINE)}>
              Close
            </Button>
            <DynamicConnectButton>
              <Button as={"a"} primary className="ml-auto">
                Sign In
              </Button>
            </DynamicConnectButton>
          </>
        }
        windowId={WINDOW_IDS.GUMBALL_MACHINE}
      />
    );
  }

  return (
    <AppLoader bgImage="/images/loading/gumball.webp">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="Gumball Machine v96"
        onClose={() => {
          closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
        }}
      >
        <GumDashboard />
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
