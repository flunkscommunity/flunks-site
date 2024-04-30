import { H2, H3, P } from "components/Typography";
import useWindowSize from "hooks/useWindowSize";
import { useState } from "react";
import { Button, Frame, Hourglass, TextInput } from "react95";
import { checkBackpackClaimed } from "web3/tx-check-claimed";

const ClaimChecker: React.FC = () => {
  const [templateId, setTemplateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [lastCheckedTemplateId, setLastCheckedTemplateId] = useState("");
  const { width } = useWindowSize();

  const handleCheck = async () => {
    if (!templateId) return;
    setLastCheckedTemplateId(templateId);
    setIsLoading(true);
    const isClaimed = await checkBackpackClaimed({ templateId }).finally(() =>
      setIsLoading(false)
    );
    setIsClaimed(isClaimed);
  };

  if (width < 768) {
    return (
      <Frame
        variant="status"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          gap: "1rem",
          overflow: "auto",
          backgroundColor:
            lastCheckedTemplateId && isClaimed ? "rgba(255,0,0,.6)" : "inherit",
        }}
      >
        <Frame variant="well">
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: "url('/images/claim-checker.png')",
              backgroundSize: "cover",
              backgroundPosition: "top",
              minHeight: "200px",
            }}
          />
        </Frame>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <TextInput
              type="number"
              value={templateId}
              placeholder="Student's serial number.."
              onChange={(e) => setTemplateId(e.target.value)}
              fullWidth={true}
            />
            <Button
              style={{
                minWidth: "80px",
              }}
              disabled={isLoading}
              onClick={handleCheck}
            >
              {isLoading && <Hourglass size={16} />}
              {!isLoading && "Search"}
            </Button>
          </div>
          {lastCheckedTemplateId && (
            <H2>
              {isLoading && `Checking #${lastCheckedTemplateId}...`}

              {isClaimed &&
                !isLoading &&
                `⛔ #${lastCheckedTemplateId} has already claimed a backpack`}
              {!isClaimed &&
                !isLoading &&
                `✅ #${lastCheckedTemplateId} has not claimed a backpack`}
            </H2>
          )}
          <P>
            If you have a student serial number, you can use this tab to check
            if a backpack has been claimed from the lost and found. Simply enter
            your serial number in the designated field and hit the "Search"
            button. If a backpack has been claimed, you will see the relevant
            information displayed on the screen.
            <br /> <br />
            Please note that it is important to check back regularly as new
            items may be added to the lost and found on a regular basis.
          </P>
        </div>
      </Frame>
    );
  }

  return (
    <Frame
      variant="status"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        gap: "1rem",
        backgroundColor:
          lastCheckedTemplateId && isClaimed ? "rgba(255,0,0,.6)" : "inherit",
      }}
    >
      <Frame variant="well">
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: "url('/images/claim-checker.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        />
      </Frame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        <P>
          If you have a student serial number, you can use this tab to check if
          a backpack has been claimed from the lost and found. Simply enter your
          serial number in the designated field and hit the "Search" button. If
          a backpack has been claimed, you will see the relevant information
          displayed on the screen.
          <br /> <br />
          Please note that it is important to check back regularly as new items
          may be added to the lost and found on a regular basis.
        </P>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <TextInput
            type="number"
            value={templateId}
            placeholder="Student's serial number.."
            onChange={(e) => setTemplateId(e.target.value)}
            fullWidth={"true"}
          />
          <Button
            style={{
              minWidth: "80px",
            }}
            disabled={isLoading}
            onClick={handleCheck}
          >
            {isLoading && <Hourglass size={16} />}
            {!isLoading && "Search"}
          </Button>
        </div>
        {lastCheckedTemplateId && (
          <H2>
            {isLoading && `Checking #${lastCheckedTemplateId}...`}

            {isClaimed &&
              !isLoading &&
              `⛔ #${lastCheckedTemplateId} has already claimed a backpack`}
            {!isClaimed &&
              !isLoading &&
              `✅ #${lastCheckedTemplateId} has not claimed a backpack`}
          </H2>
        )}
      </div>
    </Frame>
  );
};

export default ClaimChecker;
