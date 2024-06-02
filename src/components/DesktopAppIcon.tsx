import useWindowSize from "hooks/useWindowSize";
import styled from "styled-components";

interface Props {
  title: string;
  icon: string;
  onDoubleClick: () => void;
}

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
`;

// Styled component that takes an image url as a prop
const AppIcon = styled.div<{ icon: string }>`
  width: 64px;
  height: 64px;
  background-image: url(${(props) => props.icon});
  background-size: contain;
  background-position: center;
`;

const AppTitle = styled.div`
  color: white;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const DesktopAppIcon: React.FC<Props> = (props) => {
  const { title, icon, onDoubleClick } = props;
  const { width } = useWindowSize();

  const handleMobileOpen = () => {
    if (width < 768) {
      onDoubleClick();
    }
  };

  return (
    <div className="w-auto !max-w-[100px] h-auto">
      <div
        // onDoubleClick={onDoubleClick}
        onClick={onDoubleClick}
        className="p-2 flex-shrink-0 max-w-full"
      >
        <Container className="group flex flex-col gap-2 items-center">
          <AppIcon icon={icon} />
          <AppTitle className="group-hover:!bg-[#30c5ff80] text-pretty max-w-[80px] min-w-[80px] text-center backdrop-blur-lg">
            <span className="text-xl text-white font-bold drop-shadow-[0px_2px_1px_rgba(0,0,0,1)] tracking-wide">
              {title}
            </span>
          </AppTitle>
        </Container>
      </div>
    </div>
  );
};

export default DesktopAppIcon;
