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
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 8px;
  width: 100%;
  height: 100%;
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
  
  /* Mobile: Scale up in larger containers but keep reasonable */
  .col-span-2 & {
    width: 120px;
    height: 120px;
  }
  
  /* Tablet and up: Larger icons */
  @media (min-width: 768px) {
    .col-span-2 & {
      width: 180px;
      height: 180px;
    }
  }
  
  /* Desktop: Standard icon size with animation */
  @media (min-width: 1024px) {
    width: 96px;
    height: 96px;
    animation: float 3s ease-in-out infinite;
    
    /* Much larger in 2x2 grid cells - fill the space */
    .col-span-2 & {
      width: 280px;
      height: 280px;
    }
  }
  
  @media (min-width: 1280px) {
    /* Extra large on bigger screens */
    .col-span-2 & {
      width: 320px;
      height: 320px;
    }
  }
  
  /* Hover effect for the icon - slight enlargement */
  .group:hover & {
    transform: scale(1.05);
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
  
  /* Larger title in 2x2 grid cells - responsive */
  .col-span-2 & span {
    font-size: 1.5rem;
    font-weight: 800;
  }
  
  @media (min-width: 768px) {
    .col-span-2 & span {
      font-size: 2rem;
      font-weight: 900;
    }
  }
  
  @media (min-width: 1024px) {
    .col-span-2 & span {
      font-size: 2.5rem;
      font-weight: 900;
    }
  }
  
  @media (min-width: 1280px) {
    .col-span-2 & span {
      font-size: 3rem;
      font-weight: 900;
    }
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
    <div className="w-full h-full flex justify-center items-center">
      <div
        // onDoubleClick={onDoubleClick}
        onClick={onDoubleClick}
        className="p-2 w-full h-full transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        <Container className="group flex flex-col gap-2 items-center justify-center h-full w-full">
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
