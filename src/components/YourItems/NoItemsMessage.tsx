import { Button, Frame } from "react95";

const NoItemsMessage = () => {
  return (
    <Frame
      variant="field"
      className="h-full !flex items-center justify-center flex-col"
    >
      <img src="/images/icons/warning.png" />
      <span className="text-xl font-bold mt-2">No items found</span>

      <span className="text-base max-w-[200px] text-center">
        You can add items to your collection by visiting Flowty.
      </span>

      <a
        href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks?sort=%7B%22direction%22%3A%22asc%22%2C%22listingKind%22%3A%22storefront%22%2C%22path%22%3A%22usdValue%22%7D"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="lg"
          className="flex flex-row items-center gap-2 !text-xl !px-4 !py-3 min-w-[230px] mt-4"
        >
          <img src="/images/icons/flowty.png" className="h-5" />
          Flunks on Flowty
        </Button>
      </a>
      <a
        href="https://www.flowty.io/collection/0x807c3d470888cc48/Backpack?sort=%7B%22direction%22%3A%22asc%22%2C%22listingKind%22%3A%22storefront%22%2C%22path%22%3A%22usdValue%22%7D"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="lg"
          className="flex flex-row items-center gap-2 !text-xl !px-4 !py-3 min-w-[230px] mt-2"
        >
          <img src="/images/icons/flowty.png" className="h-5" />
          Backpacks on Flowty
        </Button>
      </a>
    </Frame>
  );
};
export default NoItemsMessage;
