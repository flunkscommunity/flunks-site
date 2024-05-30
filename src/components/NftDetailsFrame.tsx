import { MarketplaceIndividualNftDto } from "api/generated";
import { useEffect, useState } from "react";
import { Frame, ScrollView } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import { incrementRankByOne } from "utils";
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
  const { uri, cid, path, mimetype, Type: type, ...usefulMetadata } =
    metadata as Metadata;
  const [graduatedUrl, setGraduatedUrl] = useState<string | null>(null);

  const sha256 = async (str: string) => {
    const buf = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  useEffect(() => {
    if (!nft) return;

    sha256(nft.templateId.toString()).then((hash) => {
      setGraduatedUrl(
        `https://storage.googleapis.com/flunk-graduation/${hash}.png`
      );
    });
  }, [nft]);

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
          <FlunkImage
            src={type === "Graduated" ? graduatedUrl : uri}
            width="250px"
            height="250px"
          />
          <H1>Flunk #{templateId}</H1>

          <Frame
            variant="status"
            style={{
              padding: ".5rem 1rem",
            }}
          >
            <H3>Ranked #{incrementRankByOne(rank)} of 9999 Students</H3>
          </Frame>

          <TraitsBox nft={nft} />
          <GuardianBox nft={nft} graduatedUrl={graduatedUrl} />
          <GraduationBox nft={nft} />
        </Frame>
      </ScrollView>
    </div>
  );
};

export default NftDetailsFrame;
