import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { StakingInfo, useStakingContext } from "contexts/StakingContext";
import React from "react";
import { Button, TableDataCell, TableRow } from "react95";
import styled from "styled-components";
import { getTokenStakeInfo } from "web3/script-get-token-stake-info";
import { getPendingRewardsOne } from "web3/script-pending-reward-one";
import { stakeOne } from "web3/tx-stake-one";

const CustomTableDataCell = styled(TableDataCell)`
  flex: 1 0 0%;
  display: flex;
  items-align: center;
  justify-content: center;
`;

interface RowItemProps {
  image: string;
  tokenId: number;
  prettyCollection: string;
  collectionName: string;
  stakingInfo: StakingInfo;
  rewards: number;
}

const ImageBackground = styled.div`
  background-color: ${({ theme }) => theme.borderLight};
`;

const RowItem: React.FC<RowItemProps> = (props) => {
  const { stakeSingle, unstakeSingle } = useStakingContext();

  return (
    <TableRow className="!flex !items-center justify-center !w-full !min-h-[50px] shadow-sm">
      <CustomTableDataCell className="!items-center !h-full !justify-start">
        <div className="relative flex items-center justify-center h-full">
          <img
            src={props.image}
            className="w-6 h-6 lg:w-10 lg:h-10 object-contain mr-2 rounded-full z-10"
          />
          <ImageBackground className="w-6 h-6 lg:w-10 lg:h-10 absolute z-0 rounded-full right-2" />
        </div>
        <span className="hidden lg:block text-sm lg:text-base mr-1 truncate">
          {props.prettyCollection} #{props.tokenId}
        </span>
        <span className="lg:hidden text-sm lg:text-base tracking-widest truncate">
          #{props.tokenId}
        </span>
      </CustomTableDataCell>
      <CustomTableDataCell className="text-sm lg:text-base !justify-start">
        {Number(props?.rewards || 0.0).toFixed(5)}
      </CustomTableDataCell>

      <CustomTableDataCell className="!justify-end text-sm lg:text-base">
        {!props.stakingInfo && (
          <Button
            onClick={() =>
              stakeSingle(
                props.collectionName as "Backpack" | "Flunks",
                props.tokenId
              )
            }
            size="sm"
            variant="thin"
          >
            Stake
          </Button>
        )}
        {props.stakingInfo && (
          <Button
            onClick={() =>
              unstakeSingle(
                props.collectionName as "Backpack" | "Flunks",
                props.tokenId
              )
            }
            size="sm"
            variant="thin"
          >
            Unstake
          </Button>
        )}
      </CustomTableDataCell>
    </TableRow>
  );
};

export default RowItem;
