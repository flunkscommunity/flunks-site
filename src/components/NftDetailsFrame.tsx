import { MarketplaceIndividualNftDto } from "api/generated";
import { Frame, ScrollView } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import { FlunkImage } from "./CustomMonitor";
import GraduationBox from "./NftDetailsBoxes/GraduationBox";
import GuardianBox from "./NftDetailsBoxes/GuardianBox";
import TraitsBox from "./NftDetailsBoxes/TraitsBox";
import { H1, H3 } from "./Typography";

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
  const { metadata, templateId, rank, ownerAddress } = nft;
  const { uri, cid, path, mimetype, ...usefulMetadata } = metadata as Metadata;

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
          <FlunkImage src={uri} width="250px" height="250px" />
          <H1>Flunk #{templateId}</H1>

          <Frame
            variant="status"
            style={{
              padding: ".5rem 1rem",
            }}
          >
            <H3>Ranked #{rank} of 9999 Students</H3>
          </Frame>

          <TraitsBox nft={nft} />
          <GuardianBox nft={nft} />
          <GraduationBox nft={nft} />
        </Frame>
      </ScrollView>
    </div>
  );
};

export default NftDetailsFrame;
