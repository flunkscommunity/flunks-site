import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUsersControllerGetUserNftsByWalletAddress } from "generated/api/users/users";
import {
  Anchor,
  Frame,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "react95";
import RowItem from "./RowItem";
import styled from "styled-components";
import { useStakingContext } from "contexts/StakingContext";
import DapperIncompatibility from "./DapperIncompatibility";
import { useRef } from "react";

const CustomTableHeadCell = styled(TableHeadCell)`
  flex: 1 0 0%;
`;
const CustomTableDataCell = styled(TableDataCell)`
  flex: 1 0 0%;
  display: flex;
  items-align: center;
  justify-content: center;
`;

const StakeableItemsTable = () => {
  const { isDapper, walletStakeInfo, sortStakeInfo } = useStakingContext();
  const { primaryWallet } = useDynamicContext();
  const nameOrderByRef = useRef<"asc" | "dsc">("asc");
  const earnedOrderByRef = useRef<"asc" | "dsc">("asc");
  const earningOrderByRef = useRef<"asc" | "dsc">("asc");

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
            <CustomTableHeadCell
              onClick={() => {
                sortStakeInfo("name", nameOrderByRef.current);
                nameOrderByRef.current =
                  nameOrderByRef.current === "asc" ? "dsc" : "asc";
              }}
              disabled={isDapper}
              className="flex-grow"
            >
              Item
            </CustomTableHeadCell>
            <CustomTableHeadCell
              onClick={() => {
                sortStakeInfo("rewards", earnedOrderByRef.current);
                earnedOrderByRef.current =
                  earnedOrderByRef.current === "asc" ? "dsc" : "asc";
              }}
              disabled={isDapper}
              className="flex-grow"
            >
              Rewards
            </CustomTableHeadCell>
            <CustomTableHeadCell
              onClick={() => {
                sortStakeInfo("staked", earningOrderByRef.current);
                earningOrderByRef.current =
                  earningOrderByRef.current === "asc" ? "dsc" : "asc";
              }}
              disabled={isDapper}
              className="flex-grow"
            >
              Stake Status
            </CustomTableHeadCell>
          </TableRow>
        </TableHead>
        {isDapper && <DapperIncompatibility />}

        {!isDapper && (
          <TableBody className="!h-full !flex !flex-col !w-full no-scrollbar">
            {walletStakeInfo.length < 1 && (
              <TableRow className="!flex !items-center !w-full">
                <CustomTableDataCell className="!flex-grow">
                  <p className="text-center text-lg">NO ITEMS</p>
                </CustomTableDataCell>
              </TableRow>
            )}
            {walletStakeInfo.length > 0 &&
              walletStakeInfo.map((item) => (
                <RowItem
                  prettyCollection={
                    item.collection === "Flunks" ? "Flunk" : "Backpack"
                  }
                  collectionName={item.collection}
                  image={item.MetadataViewsDisplay.thumbnail.url}
                  tokenId={Number(item.tokenID)}
                  key={`${item.collection}-${item.tokenID}`}
                  stakingInfo={item.stakingInfo}
                  rewards={item.rewards}
                />
              ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
};

export default StakeableItemsTable;
