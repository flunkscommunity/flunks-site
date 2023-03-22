import {
  GetUserWalletNftsDto,
  MarketplaceIndividualNftDto,
  UsersApiUsersControllerGetUserNftsByWalletAddressRequest,
} from "api/generated";
import { usePaginatedContext } from "contexts/PaginatedContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button, Frame, Hourglass, ScrollView } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import { incrementRankByOne } from "utils";
import FlunkDetails from "windows/FlunkDetails";
import { H3, H4, P } from "./Typography";

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

const YourStudentsFrameGrid: React.FC = () => {
  const {
    nfts: _nfts,
    page,
    setPage,
    isValidating,
    requestParameters,
    setRequestParameters,
  } = usePaginatedContext<GetUserWalletNftsDto>();
  const [cursor, setCursor] = useState(0);
  const { closeWindow } = useWindowsContext();
  const { ref: loadMoreRef } = useInView({
    onChange(inView) {
      if (inView && cursor < nfts.Flunks.length) {
        setCursor(cursor + 1);
        // console.log(cursor);
      }
    },
  });
  const nfts = _nfts?.Flunks || [];

  useEffect(() => {
    setPage(page + 1);
  }, [cursor]);

  if (_nfts.length === 0 && isValidating) {
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
          padding: "1rem",
        }}
      >
        <H3>No Students Found</H3>
        <br />
        <Button
          onClick={() => {
            setRequestParameters({
              ...(requestParameters as Record<string, unknown>),
              traits: "",
            });
            closeWindow(WINDOW_IDS.FILTERS_WINDOW);
          }}
        >
          Clear Filters
        </Button>
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
        {nfts.map((nft) => (
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
          <H4>Rank #{incrementRankByOne(rank)}</H4>
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

export default YourStudentsFrameGrid;
