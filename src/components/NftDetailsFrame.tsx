import { MarketplaceIndividualNftDto } from "api/generated";
import {
  differenceInSeconds,
  format,
  formatDistance,
  isAfter,
  isBefore,
  subSeconds,
} from "date-fns";
import {
  Anchor,
  Avatar,
  Frame,
  GroupBox,
  ScrollView,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import { FlunkImage } from "./CustomMonitor";
import { H1, H2, H3, H4, H5, P } from "./Typography";

interface Props {
  nft: MarketplaceIndividualNftDto;
}

const GuardianInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NftDetailsFrame: React.FC<Props> = (props) => {
  const { nft } = props;
  const { metadata, templateId, rank, ownerAddress, NftActivity } = nft;
  const { uri, cid, path, mimetype, ...usefulMetadata } = metadata as Metadata;

  // const OwnershipEventsSortedByDate = NftActivity.filter(({ activity }) => {
  //   return (
  //     activity === "TRANSFER" || activity === "MINT" || activity === "SALE"
  //   );
  // }).sort((a, b) =>
  //   new Date(a.eventDate).getTime() > new Date(b.eventDate).getTime() ? -1 : 1
  // );

  const [ownershipEvents, listingEvents] = NftActivity.reduce(
    (acc, curr) => {
      const { activity } = curr;

      if (
        activity === "TRANSFER" ||
        activity === "MINT" ||
        activity === "SALE"
      ) {
        acc[0].push(curr);
      } else if (activity === "LIST") {
        acc[1].push(curr);
      }

      return acc;
    },
    [[], []]
  );

  const [currentOwnerEvent] = ownershipEvents.sort((a, b) =>
    new Date(a.eventDate).getTime() > new Date(b.eventDate).getTime() ? -1 : 1
  );
  const [latestListingEvent] = listingEvents.sort((a, b) =>
    new Date(a.eventDate).getTime() > new Date(b.eventDate).getTime() ? -1 : 1
  );

  const graduationDate = () => {
    if (!latestListingEvent) {
      return "A";
    }

    const A = new Date("2022-05-01:13:00:00");
    const B = new Date("2022-06-01:13:00:00");
    const C = new Date("2022-07-01:13:00:00");

    if (isAfter(new Date(latestListingEvent.eventDate), C)) {
      return "D";
    }

    if (isAfter(new Date(latestListingEvent.eventDate), B)) {
      return "C";
    }

    if (isAfter(new Date(latestListingEvent.eventDate), A)) {
      return "B";
    }

    return "A";
  };

  const graduationDates = {
    A: "2022-12-21:13:00:00",
    B: "2023-01-21:13:00:00",
    C: "2023-02-21:13:00:00",
    D: "2023-04-21:13:00:00",
  };

  return (
    <div
      variant="field"
      style={{
        height: "100%",
        width: "100%",
        maxHeight: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <ScrollView
        style={{
          overflow: "auto",
        }}
      >
        <Frame
          variant="outside"
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <FlunkImage src={uri} width="200px" height="200px" />
          <H1>Flunk #{templateId}</H1>

          <Frame
            variant="status"
            style={{
              padding: ".5rem 1rem",
            }}
          >
            <H3>Ranked #{rank} of 9999 Students</H3>
          </Frame>

          <GroupBox
            label="TRAITS AND HOBBIES"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              marginTop: "2rem",
              padding: "2rem",
            }}
          >
            {Object.entries(usefulMetadata).map(([key, value]) => (
              <GroupBox label={key.toUpperCase()} variant="default">
                <H3>{value}</H3>
              </GroupBox>
            ))}
          </GroupBox>

          <GroupBox
            label="PROVENANCE"
            style={{
              alignSelf: "start",
              width: "100%",
            }}
          >
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
                <Avatar
                  size={60}
                  src={`https://source.boringavatars.com/pixel/scale3200/${ownerAddress}?colors=000000,276EF1,03703C,FFC043,E11900,FFFFFF`}
                />
              </div>
              <H3
                style={{
                  gridColumn: "2",
                  gridRow: "1",
                }}
              >
                <Anchor
                  href={`https://zeero.art/users/${ownerAddress}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {ownerAddress}
                </Anchor>
              </H3>
              <P
                style={{
                  gridColumn: "2",
                  gridRow: "2",
                  fontSize: "1.25rem",
                }}
              >
                Purchased{" "}
                {formatDistance(
                  subSeconds(
                    new Date(),
                    differenceInSeconds(
                      new Date(),
                      new Date(currentOwnerEvent.eventDate)
                    )
                  ),
                  new Date(),
                  { addSuffix: true }
                )}
              </P>
            </div>
          </GroupBox>

          <GroupBox
            label="GRADUATION"
            style={{
              alignSelf: "start",
              width: "100%",
            }}
          >
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
                  {graduationDate()}
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
                    new Date(graduationDates[graduationDate()]),
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
                Last Listed: {"   "}
                {latestListingEvent
                  ? formatDistance(
                      subSeconds(
                        new Date(),
                        differenceInSeconds(
                          new Date(),
                          new Date(latestListingEvent.eventDate)
                        )
                      ),
                      new Date(),
                      { addSuffix: true }
                    )
                  : "Never Listed 💎✋"}
              </P>
            </div>
          </GroupBox>
        </Frame>
      </ScrollView>
    </div>
  );
};

export default NftDetailsFrame;
