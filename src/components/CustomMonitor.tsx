import React, { forwardRef } from "react";
import { AppBar, Button, ScrollViewProps, TextInput, Toolbar } from "react95";
import styled from "styled-components";

export const StyledScrollView = styled.div<Pick<ScrollViewProps, "shadow">>`
  position: relative;
  box-sizing: border-box;
  padding: 2px;
  font-size: 1rem;
  border-style: solid;
  border-width: 2px;
  border-left-color: ${({ theme }) => theme.borderDark};
  border-top-color: ${({ theme }) => theme.borderDark};
  border-right-color: ${({ theme }) => theme.borderLightest};
  border-bottom-color: ${({ theme }) => theme.borderLightest};
  line-height: 1.5;
  &:before {
    position: absolute;
    left: 0;
    top: 0;
    content: "";
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-style: solid;
    border-width: 2px;
    border-left-color: ${({ theme }) => theme.borderDarkest};
    border-top-color: ${({ theme }) => theme.borderDarkest};
    border-right-color: ${({ theme }) => theme.borderLight};
    border-bottom-color: ${({ theme }) => theme.borderLight};
    pointer-events: none;
    ${(props) => props.shadow && `box-shadow:${insetShadow};`}
  }
`;

type MonitorProps = {
  backgroundStyles?: React.CSSProperties;
  children?: React.ReactNode;
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Inner = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const MonitorBody = styled.div`
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0%;
  background: ${({ theme }) => theme.material};
  border-top: 4px solid ${({ theme }) => theme.borderLightest};
  border-left: 4px solid ${({ theme }) => theme.borderLightest};
  border-bottom: 4px solid ${({ theme }) => theme.borderDark};
  border-right: 4px solid ${({ theme }) => theme.borderDark};
  outline: 1px dotted ${({ theme }) => theme.material};
  outline-offset: -3px;
  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    outline: 1px dotted ${({ theme }) => theme.material};
  }
  box-shadow: 1px 1px 0 1px ${({ theme }) => theme.borderDarkest};
  @media (min-width: 768px) {
    &:after {
      content: "";
      display: inline-block;
      position: absolute;
      bottom: 4px;
      right: 12px;
      width: 16px;
      border-top: 2px solid #4d9046;
      border-bottom: 6px solid #07ff00;
    }
  }
`;

const Background = styled(StyledScrollView).attrs(() => ({
  "data-testid": "background",
}))`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

export const FlunkImage = styled.img`
  border-style: inset;
  border-bottom: 4px solid ${({ theme }) => theme.borderLight};
  border-right: 4px solid ${({ theme }) => theme.borderLight};
  border-top: 4px solid ${({ theme }) => theme.borderDark};
  border-left: 4px solid ${({ theme }) => theme.borderDark};
`;

const MonitorScreenContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100% - 48px);
  width: 100%;
  overflow: hidden;
`;

const CustomMonitor = forwardRef<HTMLDivElement, MonitorProps>(
  ({ backgroundStyles, children, ...otherProps }, ref) => {
    return (
      <Wrapper ref={ref} {...otherProps}>
        <Inner>
          <MonitorBody>
            <Background className="crt" style={backgroundStyles}>
              <MonitorScreenContainer>{children}</MonitorScreenContainer>

              <AppBar
                fixed={false}
                style={{
                  zIndex: 1000,
                  top: "100%",
                  transform: "translateY(-100%)",
                }}
              >
                <Toolbar style={{ justifyContent: "space-between" }}>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Button
                      // onClick={() => setOpen(!open)}
                      // active={open}
                      style={{ fontWeight: "bold" }}
                    >
                      <img
                        src={"/images/os-logo.png"}
                        alt="react95 logo"
                        style={{ height: "20px", marginRight: 4 }}
                      />
                      Start
                    </Button>
                    {/* {open && (
                      <MenuList
                        style={{
                          position: "absolute",
                          left: "0",
                          top: "100%",
                        }}
                        onClick={() => setOpen(false)}
                      >
                        <MenuListItem>
                          <span role="img" aria-label="👨‍💻">
                            👨‍💻
                          </span>
                          Profile
                        </MenuListItem>
                        <MenuListItem>
                          <span role="img" aria-label="📁">
                            📁
                          </span>
                          My account
                        </MenuListItem>
                        <Separator />
                        <MenuListItem disabled>
                          <span role="img" aria-label="🔙">
                            🔙
                          </span>
                          Logout
                        </MenuListItem>
                      </MenuList>
                    )} */}
                  </div>

                  <TextInput placeholder="Search..." width={150} />
                </Toolbar>
              </AppBar>
            </Background>
          </MonitorBody>
        </Inner>
      </Wrapper>
    );
  }
);

export default CustomMonitor;
