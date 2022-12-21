import { useUser } from "contexts/WalletContext";
import { Button, Frame, TextInput } from "react95";
import styled from "styled-components";
import CustomMonitor from "./CustomMonitor";
import DraggableResizeableWindow from "./DraggableResizeableWindow";
import { P } from "./Typography";

const LoginScreenContainer = styled(Frame)`
  display: grid;
  grid-template-columns: 2fr 8fr 2fr;
  gap: 16px;
  padding-top: 2rem;
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  width: 100%;
  height: 100%;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Flunks95Logo = styled.img`
  width: 100%;
  max-width: 100px;
  @media (max-width: 768px) {
    max-width: 60%;
    justify-self: center;
  }
`;

const LoginScreen = () => {
  const { authenticate } = useUser();

  return (
    <CustomMonitor
      backgroundStyles={{
        backgroundImage: "url('/images/loginbg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <DraggableResizeableWindow
          headerTitle="Welcome to Flunks"
          showHeaderActions={false}
          initialHeight="400px"
          initialWidth="auto"
        >
          <LoginScreenContainer variant="field">
            <Flunks95Logo src="/images/os-logo-large.png" alt="Flunks Logo" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                gap: 16,
              }}
            >
              <P>Type a user name and password to log on to Flunks High </P>

              <form
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: 16,
                }}
              >
                <P>
                  <u>U</u>sername
                </P>

                <TextInput
                  disabled
                  value="JJones67"
                  autoComplete={"off"}
                  placeholder="Doesn't really matter what you put in here"
                />

                <P>
                  <u>P</u>assword
                </P>

                <TextInput
                  disabled
                  value="********"
                  autoComplete={"off"}
                  placeholder="Check Discord"
                  type="password"
                />
              </form>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <Button onClick={authenticate}>Log On</Button>
            </div>
          </LoginScreenContainer>
        </DraggableResizeableWindow>
      </div>
    </CustomMonitor>
  );
};

export default LoginScreen;
