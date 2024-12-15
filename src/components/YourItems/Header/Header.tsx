import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { usePaginatedItems } from "contexts/UserPaginatedItems";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useEffect, useState } from "react";
import { Button, Frame, Separator } from "react95";
import { getGumBalance } from "web3/script-get-gum-balance";
import GumballMachine from "windows/GumballMachine";
import YourItemsGridFilter from "./Filter";

const Counter = ({ label, count }) => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || null;

  return (
    <div className="flex w-full">
      <Frame
        variant="field"
        className="w-full px-3 py-1 !flex justify-between"
        style={{
          opacity: walletAddress ? 1 : 0.5,
        }}
      >
        <span className="text-lg">{label}</span>
        <span className="text-lg font-bold">{count}</span>
      </Frame>
    </div>
  );
};

const YourItemsGridHeader = () => {
  const { openWindow } = useWindowsContext();
  const { flunksCount, backpacksCount } = usePaginatedItems();

  const [gumBalance, setGumBalance] = useState<number>(0);
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || null;

  useEffect(() => {
    if (!walletAddress) return;

    getGumBalance(walletAddress).then(setGumBalance);
  }, [walletAddress]);

  return (
    <>
      <Frame variant="field" className="!w-full">
        <div className="flex">
          <Counter label="Flunks" count={flunksCount} />
          <Counter label="Backpacks" count={backpacksCount} />
        </div>
        <div className="flex w-full">
          <Counter label="GUM" count={Number(gumBalance || 0)?.toFixed(5)} />
          <Frame
            variant="well"
            className="col-span-3 !flex items-end justify-end"
          >
            <Button
              onClick={() => {
                openWindow({
                  key: WINDOW_IDS.GUMBALL_MACHINE,
                  window: <GumballMachine />,
                });
              }}
              variant="raised"
              className="text-xl !flex gap-2"
            >
              <img src="/images/icons/gum-machine.png" className="h-6" />
            </Button>
          </Frame>
        </div>
      </Frame>
      <YourItemsGridFilter />
      <Separator className="!my-2" />
    </>
  );
};

export default YourItemsGridHeader;
