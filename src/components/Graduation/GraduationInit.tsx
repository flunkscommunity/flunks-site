import { MarketplaceIndividualNftDto } from "api/generated";
import { useFclTransactionContext } from "contexts/FclTransactionContext";
import { Button, Frame, Toolbar } from "react95";

interface GraduationInitProps {
  flunk: MarketplaceIndividualNftDto;
}

const GraduationInit: React.FC<GraduationInitProps> = (props) => {
  const { flunk } = props;
  const { executeTx, state } = useFclTransactionContext();
  
  return (
    <Frame
      variant="well"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button>Hack grades</Button>
    </Frame>
  );
};

export default GraduationInit;
