import { useWindowsContext } from "contexts/WindowsContext";
import useWindowSize from "hooks/useWindowSize";
import Draggable from "react-draggable";
import styled from "styled-components";
import StudentExplorer from "windows/StudentExplorer";
import { H1, H4 } from "./Typography";

interface Props {
  title: string;
  icon: string;
  onDoubleClick: () => void;
}

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  max-width: 80px;
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

const AppTitle = styled(H4)`
  color: white;
  &:hover {
    span {
      background-color: rgba(48, 197, 255, 0.5);
    }
  }
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
    <Draggable disabled={width < 768} bounds="parent">
      <div
        style={{
          width: 80,
          margin: 8,
        }}
      >
        <div onDoubleClick={onDoubleClick} onClick={handleMobileOpen}>
          <Container>
            <AppIcon icon={icon} />
            <AppTitle>
              <span>{title}</span>
            </AppTitle>
          </Container>
        </div>
      </div>
    </Draggable>
  );
};

export default DesktopAppIcon;
