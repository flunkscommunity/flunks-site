import { MarketplaceIndividualNftDto } from "api/generated";
import BackpackDetailsFrame from "components/Backpacks/BackpackDetailsFrame";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import NftDetailsFrame from "components/NftDetailsFrame";
import { useWindowsContext } from "contexts/WindowsContext";

interface Props {
  backpack: MarketplaceIndividualNftDto;
}

const BackpackDetails: React.FC<Props> = (props) => {
  const { backpack } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`backpack-${backpack.templateId}`);
      }}
      headerTitle={`backpack-details-#${backpack.templateId}`}
      initialHeight="60%"
      initialWidth="40%"
    >
      <BackpackDetailsFrame nft={backpack} />
    </DraggableResizeableWindow>
  );
};

export default BackpackDetails;
