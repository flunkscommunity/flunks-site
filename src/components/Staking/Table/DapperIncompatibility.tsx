import { useStakingContext } from "contexts/StakingContext";
import { Anchor, Frame, TableBody, Tooltip } from "react95";

export default function DapperIncompatibility() {
  // const { walletStakeInfo } = useStakingContext();
  const walletStakeInfo = [];
  return (
    <>
      <TableBody className="!relative !h-full !flex !flex-col !w-full !items-center">
        <div className="flex flex-col gap-10 max-w-[280px] md:max-w-[400px] text-center py-10">
          <p className="text-xl font-bold">
            <img
              src="/images/icons/warning.png"
              className="w-8 h-8 mx-auto mb-2"
            />
            Dapper Wallet is not supported
          </p>
          <p>
            <Tooltip
              text="Flunks related NFTs"
              className="left-0"
              enterDelay={0}
              leaveDelay={100}
              position="top"
            >
              <span className="inline-block !cursor-help !underline">
                Flunk Items
              </span>
            </Tooltip>{" "}
            in your Dapper Wallet cannot earn gum. The transactions and
            contracts required to earn gum are not supported by Dapper Wallet.
            Please use a different wallet to earn gum.
          </p>

          <p>
            Moving forward, all future Flunks related contracts and transactions
            will not be supported by Dapper Wallet. If you wish to participate
            in future developments, please consider using a different wallet.
          </p>

          <p>
            Dapper Wallet provides a secure and easy way to transfer your Flunk
            items to a different wallet. Navigate to{" "}
            <Anchor
              href="https://accounts.meetdapper.com/inventory?page=1&sort=DESC&collection=553b5004-99fb-4c18-944b-6b292dba5bc4"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              Dapper Wallet
            </Anchor>{" "}
            to start transferring your Flunk items.
          </p>
        </div>
      </TableBody>
      <Frame
        variant="window"
        className="w-full py-2 !flex items-center justify-center"
      >
        <p className="text-sm">
          You have {walletStakeInfo.length} eligible Flunk Item
          {walletStakeInfo.length !== 1 ? "s" : ""} on Dapper.
        </p>
      </Frame>
    </>
  );
}
