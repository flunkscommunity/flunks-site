import { MarketplaceIndividualNftDto } from "api/generated";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import NftDetailsFrame from "components/NftDetailsFrame";
import { useWindowsContext } from "contexts/WindowsContext";

interface Props {
  flunk: MarketplaceIndividualNftDto;
}

const FlunkDetails: React.FC<Props> = (props) => {
  const { flunk } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`flunk-${flunk.templateId}`);
      }}
      headerTitle={`student-details-#${flunk.templateId}`}
      initialHeight="60%"
      initialWidth="40%"
    >
      <NftDetailsFrame nft={flunk} />
    </DraggableResizeableWindow>
  );
};

export default FlunkDetails;
