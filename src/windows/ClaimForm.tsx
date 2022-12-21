import { MarketplaceIndividualNftDto } from "api/generated";
import ClaimFormForm from "components/ClaimForm/Form";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import NftDetailsFrame from "components/NftDetailsFrame";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import { useWindowsContext } from "contexts/WindowsContext";

interface Props {
  flunk: MarketplaceIndividualNftDto;
  shouldFetch: boolean;
}

const ClaimForm: React.FC<Props> = (props) => {
  const { flunk, shouldFetch } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`claim-form-${flunk.templateId}`);
      }}
      headerTitle={`Student #${flunk.templateId} - claim form`}
      initialHeight="60%"
      initialWidth="60%"
    >
      <FclTransactionProvider>
        <ClaimFormForm nft={flunk} shouldFetch={shouldFetch} />
      </FclTransactionProvider>
    </DraggableResizeableWindow>
  );
};

export default ClaimForm;
