import ClaimFormForm from "components/ClaimForm/Form";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { NftItem } from "components/YourItems/ItemsGrid";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import { ObjectDetails } from "contexts/StakingContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { MarketplaceIndividualNftDto } from "generated/models";

interface Props {
  flunk: ObjectDetails & { pixelUrl: string };
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
      headerIcon="/images/icons/backpack.png"
    >
      <FclTransactionProvider>
        <ClaimFormForm nft={flunk} shouldFetch={shouldFetch} />
      </FclTransactionProvider>
    </DraggableResizeableWindow>
  );
};

export default ClaimForm;
