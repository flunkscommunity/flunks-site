import { MarketplaceIndividualNftDto } from "api/generated";
import { useWindowsContext } from "contexts/WindowsContext";
import { Button, Frame, ScrollView } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import FlunkDetails from "windows/FlunkDetails";
import { H3, H4, P } from "./Typography";

interface Props {
  nfts: MarketplaceIndividualNftDto[];
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 0.25rem;
`;

const FlexFrame = styled(Frame)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
  @media (max-width: 320px) {
    padding: 0.25rem;
  }
`;

const NftImage = styled.img`
  border-style: inset;
  border-bottom: 4px solid ${({ theme }) => theme.borderLight};
  border-right: 4px solid ${({ theme }) => theme.borderLight};
  border-top: 4px solid ${({ theme }) => theme.borderDark};
  border-left: 4px solid ${({ theme }) => theme.borderDark};
`;

const NftFrameGrid: React.FC<Props> = (props) => {
  const { nfts = [] } = props;

  if (nfts.length === 0) {
    return null;
  }

  return (
    <ScrollView
      style={{
        height: "100%",
      }}
    >
      <Grid>
        {nfts.map((nft) => (
          <NftFrame key={`${nft.collectionName}-${nft.tokenId}`} nft={nft} />
        ))}
      </Grid>
    </ScrollView>
  );
};

export const NftFrame: React.FC<{ nft: MarketplaceIndividualNftDto }> = (
  props
) => {
  const { nft } = props;
  const { metadata, templateId, rank } = nft;
  const { uri, Superlative } = metadata as Metadata;
  const { openWindow } = useWindowsContext();

  return (
    <FlexFrame variant="field">
      <NftImage src={uri} width="100%" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "0.25rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        <H3>Flunk #{templateId}</H3>
        <Frame
          variant="status"
          style={{
            padding: "0 0.25rem",
          }}
        >
          <H4>Rank #{rank}</H4>
        </Frame>
      </div>
      <P
        style={{
          fontSize: "1.25rem",
        }}
      >
        {Superlative}
      </P>
      <Button
        variant="flat"
        style={{
          marginTop: "auto",
        }}
        onClick={() => {
          openWindow({
            key: `flunk-${templateId}`,
            window: <FlunkDetails flunk={nft} />,
          });
        }}
      >
        Details
      </Button>
    </FlexFrame>
  );
};

export default NftFrameGrid;
