import useWindowSize from "hooks/useWindowSize";
import styled from "styled-components";

interface Props {
  title: string;
  icon: string;
  onDoubleClick: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 4px;
  width: 100%;
  min-height: 120px;
  
  /* Hover effect for the entire container */
  &:hover {
    background: rgba(48, 197, 255, 0.1);
    backdrop-filter: blur(4px);
  }
  
  @media (min-width: 1024px) {
    min-height: 140px;
  }
`;

// Styled component that takes an image url as a prop
const AppIcon = styled.div<{ icon: string }>`
  width: 64px;
  height: 64px;
  background-image: url(${(props) => props.icon});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  /* Larger icons on desktop (min-width: 1024px) */
  @media (min-width: 1024px) {
    width: 96px;
    height: 96px;
    animation: float 3s ease-in-out infinite;
  }
  
  /* Keep mobile size and disable animation for better alignment */
  @media (max-width: 1023px) {
    width: 64px;
    height: 64px;
  }
  
  /* Hover effect for the icon - slight enlargement */
  .group:hover & {
    transform: scale(1.1);
    animation-play-state: paused;
  }
  
  /* Floating animation - only on desktop */
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }
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
    <div className="w-full flex justify-center items-start">
      <div
        // onDoubleClick={onDoubleClick}
        onClick={onDoubleClick}
        className="p-2 w-full max-w-[120px] lg:max-w-[160px] transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <Container className="group flex flex-col gap-2 items-center justify-start h-full">
          <AppIcon icon={icon} />
          <AppTitle className="group-hover:!bg-[#30c5ff80] text-pretty w-full px-2 py-1 text-center backdrop-blur-lg rounded min-h-[2.5rem] flex items-center justify-center">
            <span className="text-lg lg:text-xl xl:text-2xl text-white font-bold drop-shadow-[0px_2px_1px_rgba(0,0,0,1)] tracking-wide leading-tight">
              {title}
            </span>
          </AppTitle>
        </Container>
      </div>
    </div>
  );
};

export default DesktopAppIcon;
