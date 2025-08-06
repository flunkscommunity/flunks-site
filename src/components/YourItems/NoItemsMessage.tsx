import { Button, Frame } from "react95";

const NoItemsMessage = () => {
  return (
    <Frame
      variant="field"
      className="h-full !flex items-center justify-center flex-col !p-4 !overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-center gap-3 max-w-[280px] w-full">
        <img src="/images/icons/warning.png" />
        <span className="text-xl font-bold text-center">No items found</span>

        <span className="text-base text-center">
          You can add items to your collection by visiting Flowty.
        </span>

        <a
          href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks?sort=%7B%22direction%22%3A%22asc%22%2C%22listingKind%22%3A%22storefront%22%2C%22path%22%3A%22usdValue%22%7D"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-2 !text-lg !px-3 !py-2 w-full"
          >
            <img src="/images/icons/flowty.png" className="h-4" />
            Flunks on Flowty
          </Button>
        </a>
        <a
          href="https://www.flowty.io/collection/0x807c3d470888cc48/Backpack?sort=%7B%22direction%22%3A%22asc%22%2C%22listingKind%22%3A%22storefront%22%2C%22path%22%3A%22usdValue%22%7D"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-2 !text-lg !px-3 !py-2 w-full"
          >
            <img src="/images/icons/flowty.png" className="h-4" />
            Backpacks on Flowty
          </Button>
        </a>
      </div>
    </Frame>
  );
};
export default NoItemsMessage;
