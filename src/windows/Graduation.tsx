import { MarketplaceIndividualNftDto } from "api/generated";
// import GraduationForm from "components/Graduation/Form";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import GraduationInit from "components/Graduation/GraduationInit";
import NftDetailsFrame from "components/NftDetailsFrame";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import { useWindowsContext } from "contexts/WindowsContext";

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
      initialHeight="50%"
      initialWidth="50%"
    >
      <FclTransactionProvider>
        <GraduationInit flunk={flunk} />
      </FclTransactionProvider>
    </DraggableResizeableWindow>
  );
};

export default Graduation;
