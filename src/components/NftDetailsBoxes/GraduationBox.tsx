import { MarketplaceIndividualNftDto, NftActivityDto } from "api/generated";
import { format, isAfter } from "date-fns";
import { GroupBox } from "react95";
import { H1, H3, P } from "../Typography";

interface Props {
  nft: MarketplaceIndividualNftDto;
}

const GRADUATION_DATES = {
  "A+": "2022-12-21:13:00:00",
  B: "2023-01-21:13:00:00",
  C: "2023-02-21:13:00:00",
  D: "2023-04-21:13:00:00",
};

const GraduationBox: React.FC<Props> = (props) => {
  const { nft } = props;

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

    const A = new Date("2022-05-01:13:00:00");
    const B = new Date("2022-06-01:13:00:00");
    const C = new Date("2022-07-01:13:00:00");

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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 11fr",
        gridTemplateRows: "1fr 1fr",
        columnGap: "1rem",
        alignItems: "center",
        justifyItems: "start",
      }}
    >
      <div
        style={{
          gridColumn: "1",
          gridRow: "span 2",
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
          }}
        >
          {getGraduationDate()}
        </H1>
      </div>
      <H3
        style={{
          gridColumn: "2",
          gridRow: "1",
        }}
      >
        <H3>
          Graduating on{" "}
          {format(
            new Date(
              GRADUATION_DATES[getGraduationDate()] || "2023-04-21:13:00:00"
            ),
            "MMMM do yyyy"
          )}
        </H3>
      </H3>
      <P
        style={{
          gridColumn: "2",
          gridRow: "2",
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
            new Date(lastDelistOrSale.eventDate),
            "MMMM do yyyy"
          )}.`}
      </P>
    </div>
  );
};

export default GraduationBox;
