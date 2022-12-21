import { MarketplaceIndividualNftDto } from "api/generated";
import { useWindowsContext } from "contexts/WindowsContext";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Anchor, Button, Frame, Hourglass, ScrollView } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import FlunkDetails from "windows/FlunkDetails";
import { H3, H4, P } from "components/Typography";
import BackpackDetails from "windows/BackpackDetails";

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

const LoadMore = styled.div`
  background-color: transparent;
  width: 100%;
  height: 2px;
  border: none;
  user-select: none;
`;

interface Props {
  nfts: MarketplaceIndividualNftDto[];
  isValidating: boolean;
}

const paginate = (
  arr: Props["nfts"],
  size: number
): MarketplaceIndividualNftDto[][] => {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size);
    let page = acc[idx] || (acc[idx] = []);
    page.push(val);

    return acc;
  }, []);
};

const BackpackFrameGrid: React.FC<Props> = (props) => {
  const { nfts, isValidating } = props;
  const [page, setPage] = useState(0);
  const paginatedNfts = paginate(nfts, 10);
  const [cursor, setCursor] = useState(0);
  const { ref: loadMoreRef } = useInView({
    onChange(inView) {
      if (inView && cursor < paginatedNfts?.length) {
        setCursor(cursor + 1);
        console.log(cursor);
      }
    },
  });

  useEffect(() => {
    if (cursor === paginatedNfts?.length) return;
    setPage(page + 1);
  }, [cursor]);

  if (nfts.length === 0 && isValidating) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Hourglass size={32} style={{ margin: 20 }} />
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <Frame
        variant="field"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          width: "100%",
          height: "100%",
        }}
      >
        <span
          style={{
            fontSize: "64px",
            fontWeight: "bold",
          }}
        >
          ?
        </span>
        <H3>No Accessories Found</H3>
        <Anchor
          href={`https://zeero.art/collection/backpack?include=LISTED`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <P>Browse backpacks that are up for exchange on zeero.art</P>
        </Anchor>
      </Frame>
    );
  }

  return (
    <ScrollView
      style={{
        height: "100%",
      }}
    >
      <Grid>
        {/* Map over paginatedNfts excluding anything after cursor */}
        {paginatedNfts
          ?.slice(0, cursor)
          .flat()
          .map((nft) => (
            <NftFrame key={`${nft.collectionName}-${nft.tokenId}`} nft={nft} />
          ))}
        {!isValidating ? <LoadMore ref={loadMoreRef} /> : <LoadMore />}
      </Grid>
    </ScrollView>
  );
};

export const NftFrame: React.FC<{ nft: MarketplaceIndividualNftDto }> = (
  props
) => {
  const { nft } = props;
  const { metadata, templateId, rank, collectionName } = nft;
  const { uri, Superlative } = metadata as Metadata;
  const { openWindow } = useWindowsContext();
  const labels = {
    flunks: "Flunk",
    backpack: "Backpack",
  };

  return (
    <FlexFrame variant="field">
      <NftImage
        src={uri}
        width="100%"
        style={{
          backgroundColor: "#cccccc",
        }}
      />
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
        <H3>
          {labels[collectionName.toLowerCase()]} #{templateId}
        </H3>
        <Frame
          variant="status"
          style={{
            padding: "0 0.25rem",
          }}
        >
          <H4>Rank #{rank}</H4>
        </Frame>
      </div>
      <Button
        variant="flat"
        style={{
          marginTop: "auto",
        }}
        onClick={() => {
          openWindow({
            key: `backpack-${templateId}`,
            window: <BackpackDetails backpack={nft} />,
          });
        }}
      >
        Details
      </Button>
    </FlexFrame>
  );
};

export default BackpackFrameGrid;
