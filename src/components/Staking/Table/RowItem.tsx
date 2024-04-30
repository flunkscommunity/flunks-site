import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
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
}

const RowItem: React.FC<RowItemProps> = (props) => {
  const [pendingRewards, setPendingRewards] = React.useState(0);
  const [stakedInfo, setStakedInfo] = React.useState(0);
  const { primaryWallet } = useDynamicContext();

  const getPendingReward = () => {
    getPendingRewardsOne(
      props.collectionName as "Flunks" | "Backpack",
      props.tokenId
    ).then(setPendingRewards);
  };

  React.useEffect(() => {
    if (!props.collectionName) return;
    if (!props.tokenId) return;
    if (!primaryWallet) return;

    const interval = setInterval(() => {
      getPendingReward();
    }, 30000);

    getPendingRewardsOne(
      props.collectionName as "Flunks" | "Backpack",
      props.tokenId
    ).then(setPendingRewards);
    getTokenStakeInfo(
      primaryWallet.address,
      props.collectionName as "Flunks" | "Backpack",
      props.tokenId
    ).then(setStakedInfo);

    return () => clearInterval(interval);
  }, [primaryWallet.address, props.collectionName, props.tokenId]);

  const handleStakeItem = async () => {
    console.log("Stake item", props.collectionName, props.tokenId);

    await stakeOne(
      props.collectionName as "Flunks" | "Backpack",
      props.tokenId
    ).then((x) => {
      console.log(x);
    });
  };

  return (
    <TableRow className="!flex !items-center justify-center !w-full !h-[50px] shadow-sm">
      <CustomTableDataCell className="!items-center !h-full !justify-start">
        <div className="relative flex items-center justify-center h-full">
          <img
            src={props.image}
            className="h-[60%] lg:h-[80%] object-contain mr-2 rounded-full z-10"
          />
          <div className="h-[60%] lg:h-[80%] bg-gray-400 absolute z-0 rounded-full right-2" />
        </div>
        <span className="hidden lg:block text-sm lg:text-base leading-[1] mr-1 mt-0.5">
          {props.prettyCollection}
        </span>
        <span className="text-sm lg:text-base leading-[1] mt-0.5 tracking-widest">
          #{props.tokenId}
        </span>
      </CustomTableDataCell>
      <CustomTableDataCell className="text-sm lg:text-base !justify-start">
        {pendingRewards}
      </CustomTableDataCell>
      <CustomTableDataCell className="!justify-end text-sm lg:text-base">
        {!stakedInfo && <Button onClick={handleStakeItem}>Stake</Button>}
        {stakedInfo && <span className="font-bold">Staked</span>}
      </CustomTableDataCell>
    </TableRow>
  );
};

export default RowItem;
