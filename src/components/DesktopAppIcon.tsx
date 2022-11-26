import { useWindowsContext } from "contexts/WindowsContext";
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
  width: 52px;
  height: 52px;
  background-image: url(${(props) => props.icon});
  background-size: contain;
  background-position: center;
`;

const AppTitle = styled(H4)`
  &:hover {
    span {
      background-color: rgba(48, 197, 255, 0.5);
    }
  }
`;

const DesktopAppIcon: React.FC<Props> = (props) => {
  const { title, icon, onDoubleClick } = props;

  return (
    <div onDoubleClick={onDoubleClick}>
      <Container>
        <AppIcon icon={icon} />
        <AppTitle>
          <span>{title}</span>
        </AppTitle>
      </Container>
    </div>
  );
};

export default DesktopAppIcon;
