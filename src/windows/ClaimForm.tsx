import ClaimFormForm from "components/ClaimForm/Form";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { NftItem } from "components/YourItems/ItemsGrid";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { MarketplaceIndividualNftDto } from "generated/models";

interface Props {
  flunk: NftItem;
  shouldFetch: boolean;
}

const ClaimForm: React.FC<Props> = (props) => {
  const { flunk, shouldFetch } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`claim-form-${flunk.serialNumber}`);
      }}
      headerTitle={`Claim Form - Student #${flunk.serialNumber}`}
      initialHeight="auto"
      initialWidth="auto"
      windowsId={`claim-form-${flunk.serialNumber}`}
      resizable={false}
      showMaximizeButton={false}
    >
      <FclTransactionProvider>
        <ClaimFormForm nft={flunk} shouldFetch={shouldFetch} />
      </FclTransactionProvider>
    </DraggableResizeableWindow>
  );
};

export default ClaimForm;
