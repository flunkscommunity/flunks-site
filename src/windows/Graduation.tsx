import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import GraduationInit from "components/Graduation/GraduationInit";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { MarketplaceIndividualNftDto } from "generated/models";

interface Props {
  flunk: MarketplaceIndividualNftDto;
}

const Graduation: React.FC<Props> = (props) => {
  const { flunk } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`graduation-${flunk.templateId}`);
      }}
      headerTitle={`Terminal`}
      initialHeight="70%"
      initialWidth="40%"
      windowsId={`graduation-${flunk.templateId}`}
    >
      <FclTransactionProvider>
        <GraduationInit flunk={flunk} />
      </FclTransactionProvider>
    </DraggableResizeableWindow>
  );
};

export default Graduation;
