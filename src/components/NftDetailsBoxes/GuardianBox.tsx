import { MarketplaceIndividualNftDto } from "api/generated";
import { H3, P } from "components/Typography";
import { format } from "date-fns";
import { Anchor, Avatar, GroupBox } from "react95";
import { getBoringAvatarUrl } from "utils";

interface Props {
  nft: MarketplaceIndividualNftDto;
}

const GuardianBox: React.FC<Props> = (props) => {
  const { nft } = props;
  const { NftActivity, ownerAddress } = nft;

  const [currentOwnerEvent] = NftActivity.filter(
    ({ activity }) =>
      activity === "TRANSFER" || activity === "MINT" || activity === "SALE"
  ).sort((a, b) =>
    new Date(a.eventDate).getTime() > new Date(b.eventDate).getTime() ? -1 : 1
  );

  return (
    <GroupBox
      label="LEGAL GUARDIAN"
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
          <Avatar size={60} src={getBoringAvatarUrl(ownerAddress)} />
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
          Legal guardian since{" "}
          {format(new Date(currentOwnerEvent.eventDate), "MMMM do yyyy")}
        </P>
      </div>
    </GroupBox>
  );
};

export default GuardianBox;
