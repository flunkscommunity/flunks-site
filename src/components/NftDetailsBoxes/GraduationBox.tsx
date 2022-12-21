import { MarketplaceIndividualNftDto, NftActivityDto } from "api/generated";
import { FlunkImage } from "components/CustomMonitor";
import { useUser } from "contexts/WalletContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { format, isAfter, parse } from "date-fns";
import useWindowSize from "hooks/useWindowSize";
import { useEffect, useState } from "react";
import { Button, GroupBox } from "react95";
import { checkCanGraduate } from "web3/script-check-can-graduate";
import Graduation from "windows/Graduation";
import { H1, H3, P } from "../Typography";

interface Props {
  nft: MarketplaceIndividualNftDto;
}

const GRADUATION_DATES = {
  "A+": "2022-12-21T18:00:00Z",
  B: "2023-01-21T21:00:00Z",
  C: "2023-02-21T21:00:00Z",
  D: "2023-03-21T21:00:00Z",
};

const GraduationBox: React.FC<Props> = (props) => {
  const { nft } = props;
  const { metadata } = nft;
  const { pixelUri, Type } = metadata;
  // console.log("here", pixelUri, Type);

  if (Type && Type === "Graduated")
    return (
      <GroupBox
        label="GRADUATION"
        style={{
          alignSelf: "center",
          width: "100%",
          textAlign: "center",
        }}
      >
        <br />
        <br />
        <FlunkImage src={pixelUri} width="250px" height="250px" />

        <br />
        <br />
        <H3>GRADUATED</H3>

        <P>
          Congratulations on finally escaping high school! Now go out and make
          the real world your own personal detention.
        </P>
      </GroupBox>
    );

  return (
    <GroupBox
      label="GRADUATION"
      style={{
        alignSelf: "start",
        width: "100%",
      }}
    >
      <GraduationBoxContent nft={nft} />
    </GroupBox>
  );
};

const GraduationBoxContent: React.FC<Props> = (props) => {
  const { nft } = props;
  const { NftActivity } = nft;
  const { walletAddress } = useUser();
  const { openWindow } = useWindowsContext();
  const { width } = useWindowSize();
  const [canGrauate, setCanGraduate] = useState(false);

  const isOwner = walletAddress === nft.ownerAddress;
  const listingEvents = NftActivity.filter(({ activity }) => {
    return activity === "LIST" || activity === "DELIST" || activity === "SALE";
  });
  const neverListed = listingEvents.length === 0;

  const listingEventsSorted = listingEvents.sort((a, b) =>
    new Date(a.eventDate).getTime() > new Date(b.eventDate).getTime() ? -1 : 1
  );

  const isCurrentlyListed = listingEventsSorted[0]?.activity === "LIST";

  const lastDelistOrSale = listingEventsSorted.find(
    ({ activity }) => activity === "DELIST" || activity === "SALE"
  );

  const getGraduationDate = () => {
    if (neverListed) {
      return "A+";
    }

    if (isCurrentlyListed) {
      return "D";
    }

    const A = new Date("2022-05-01T21:00:00Z");
    const B = new Date("2022-06-01T21:00:00Z");
    const C = new Date("2022-07-01T21:00:00Z");

    if (isAfter(new Date(lastDelistOrSale.eventDate), C)) {
      return "D";
    }

    if (isAfter(new Date(lastDelistOrSale.eventDate), B)) {
      return "C";
    }

    if (isAfter(new Date(lastDelistOrSale.eventDate), A)) {
      return "B";
    }

    return "A+";
  };

  useEffect(() => {
    if (!nft) return;

    checkCanGraduate({ tokenId: nft.tokenId }).then(setCanGraduate);
  }, [nft]);

  const isTodayPastGraduationDate =
    isAfter(new Date(), new Date("2022-12-21T20:00:00Z")) &&
    isAfter(new Date(), new Date(GRADUATION_DATES[getGraduationDate()]));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        columnGap: "1rem",
        alignItems: "center",
        justifyItems: "start",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <H1
          style={{
            textShadow: "2px 2px 0rem white",
            fontSize: "4rem",
          }}
        >
          {getGraduationDate()}
        </H1>
      </div>
      <H3 style={{}}>
        <H3>
          Graduating on{" "}
          {format(
            parse(
              "",
              "",
              new Date(
                GRADUATION_DATES[getGraduationDate()] || "2023-03-21T13:00:00"
              )
            ),
            "MMMM do yyyy"
          )}
        </H3>
      </H3>

      <P
        style={{
          fontSize: "1.25rem",
        }}
      >
        {neverListed && "This Student has never been put up for exchange."}
        {!neverListed &&
          isCurrentlyListed &&
          "This Student is currently up for exchange."}
        {!neverListed &&
          !isCurrentlyListed &&
          `This Student was last put up for exchange on ${format(
            parse("", "", new Date(lastDelistOrSale.eventDate)),
            "MMMM do yyyy"
          )}.`}
      </P>
      {true && isOwner && (
        <div
          style={{
            width: "100%",
            marginTop: "1rem",
          }}
        >
          <Button
            onClick={() => {
              openWindow({
                key: `graduation-${nft.templateId}`,
                window: <Graduation flunk={nft} />,
              });
            }}
            fullWidth
          >
            Initiate Graduation
          </Button>
        </div>
      )}
    </div>
  );
};

export default GraduationBox;
