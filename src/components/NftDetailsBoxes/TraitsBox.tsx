import { MarketplaceIndividualNftDto } from "api/generated";
import { H3 } from "components/Typography";
import { GroupBox } from "react95";
import { Metadata } from "types/NFT";

interface Props {
  nft: MarketplaceIndividualNftDto;
}

const TraitsBox: React.FC<Props> = (props) => {
  const { nft } = props;
  const { metadata } = nft;
  const { uri, cid, path, mimetype, pixelUri, ...usefulMetadata } = metadata as Metadata;

  return (
    <GroupBox
      label="TRAITS AND HOBBIES"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        marginTop: "2rem",
        // padding: "2rem",
      }}
    >
      {Object.entries(usefulMetadata).map(([key, value]) => (
        <GroupBox label={key.toUpperCase()} variant="default">
          <H3>{value}</H3>
        </GroupBox>
      ))}
    </GroupBox>
  );
};

export default TraitsBox;
