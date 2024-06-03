import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";

interface Props {
  title: string;
  templateId: string;
  children: React.ReactNode;
}

const FlunkfolioItem: React.FC<Props> = (props) => {
  const { templateId, title, children } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(`${WINDOW_IDS.FLUNKFOLIO_ITEM}${templateId}`);
      }}
      windowsId={`${WINDOW_IDS.FLUNKFOLIO_ITEM}${templateId}`}
      headerTitle={title}
      initialHeight="70%"
      initialWidth="auto"
      headerIcon="/images/icons/vault.png"
    >
      {children}
    </DraggableResizeableWindow>
  );
};

export default FlunkfolioItem;
