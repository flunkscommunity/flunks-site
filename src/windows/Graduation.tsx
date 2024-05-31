import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import GraduationInit from "components/Graduation/GraduationInit";
import { NftItem } from "components/YourItems/ItemsGrid";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { MarketplaceIndividualNftDto } from "generated/models";

interface Props {
  flunk: NftItem;
}

const Graduation: React.FC<Props> = (props) => {
  const { flunk } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`graduation-${flunk.serialNumber}`);
      }}
      headerTitle={`Terminal`}
      initialHeight="70%"
      initialWidth="40%"
      windowsId={`graduation-${flunk.serialNumber}`}
    >
      <FclTransactionProvider>
        <GraduationInit flunk={flunk} />
      </FclTransactionProvider>
    </DraggableResizeableWindow>
  );
};

export default Graduation;
