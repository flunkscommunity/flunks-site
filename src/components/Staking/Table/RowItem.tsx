import { StakingInfo, useStakingContext } from "contexts/StakingContext";
import React from "react";
import { Button, TableDataCell, TableRow } from "react95";
import styled from "styled-components";

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
  serialNumber: number;
}

const ImageBackground = styled.div`
  background-color: ${({ theme }) => theme.borderLight};
`;

const RowItem: React.FC<RowItemProps> = (props) => {
  const { stakeSingle, unstakeSingle } = useStakingContext();

  return (
    <TableRow className="!flex !items-center justify-center !w-full !min-h-[50px] shadow-sm">
      <CustomTableDataCell className="!items-center !h-full !justify-start">
        <span className="hidden lg:block text-sm lg:text-base mr-1 truncate">
          {props.prettyCollection} #{props.serialNumber}
        </span>
        <span className="lg:hidden text-sm lg:text-base tracking-widest truncate">
          #{props.serialNumber}
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
            onClick={() => {
              unstakeSingle(
                props.collectionName as "Backpack" | "Flunks",
                props.tokenId
              );
            }}
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
