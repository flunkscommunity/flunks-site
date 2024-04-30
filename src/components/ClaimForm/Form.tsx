import { MarketplaceIndividualNftDto } from "api/generated";
import { Button, Frame, GroupBox, Hourglass, ScrollView } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import { FlunkImage } from "components/CustomMonitor";
import GraduationBox from "components/NftDetailsBoxes/GraduationBox";
import GuardianBox from "components/NftDetailsBoxes/GuardianBox";
import TraitsBox from "components/NftDetailsBoxes/TraitsBox";
import { H1, H3, H4, P } from "components/Typography";
import { useEffect, useState } from "react";
import getBackpackClaimedData, {
  FormattedBackpackClaimData,
  FormattedClaimEventData,
} from "api/getBackpackClaimedData";
import getCollectionsNftById from "api/getCollectionNftById";
import { format } from "date-fns";
import { useBackpackClaimed } from "contexts/BackpackClaimContext";
import { CollectionApiInstance } from "api";
import { useFclTransactionContext } from "contexts/FclTransactionContext";
import { TX_STATUS } from "reducers/TxStatusReducer";
import { claimBackpack } from "web3/tx-claim-backpack";

interface Props {
  nft: MarketplaceIndividualNftDto;
  shouldFetch: boolean;
}

const GuardianInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Stack = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ClaimFormForm: React.FC<Props> = (props) => {
  const { nft, shouldFetch } = props;
  const { metadata, templateId, tokenId } = nft;
  const { uri } = metadata as Metadata;
  const { flunksData } = useBackpackClaimed();
  const [claimedItem, setClaimedItem] = useState<MarketplaceIndividualNftDto>();
  const claimedEvent =
    flunksData && flunksData[tokenId] ? flunksData[tokenId] : null;
  const { executeTx, state } = useFclTransactionContext();
  useEffect(() => {
    if (!claimedEvent) return;

    CollectionApiInstance.collectionControllerGetNftByCollectionNameAndTokenId({
      collectionName: "backpack",
      tokenId: Number(claimedEvent.backpackTokenID),
    }).then((res) => {
      setClaimedItem(res.data);
    });
  }, [claimedEvent]);

  const locations = {
    geek: "Computer lab",
    jock: "Gym",
    freak: "School Shed",
    prep: "Courtyard",
  };

  return (
    <div
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
        position: "relative",
      }}
    >
      {state.txStatus === TX_STATUS.STARTED && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          <Hourglass size={32} />
        </div>
      )}
      <ScrollView
        style={{
          overflow: "auto",
        }}
      >
        <Frame
          variant="field"
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Stack>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <FlunkImage src={uri} width="250px" height="250px" />
              <GroupBox
                label="Student"
                variant="flat"
                style={{
                  width: "100%",
                }}
              >
                <P>Flunk #{templateId}</P>
              </GroupBox>
            </div>
            {claimedItem && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <FlunkImage
                  src={claimedItem?.metadata?.uri}
                  width="250px"
                  height="250px"
                />
                <GroupBox
                  label="Claimed Item"
                  variant="flat"
                  style={{
                    width: "100%",
                  }}
                >
                  <P>Backpack #{claimedItem.templateId}</P>
                </GroupBox>
              </div>
            )}
            {!claimedItem && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Frame
                  variant="field"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <H1
                    style={{
                      fontSize: "6rem",
                      fontWeight: "normal",
                    }}
                  >
                    ?
                  </H1>
                </Frame>
                <GroupBox
                  label="Claimed Item"
                  variant="flat"
                  style={{
                    width: "100%",
                  }}
                >
                  <P>????</P>
                </GroupBox>
              </div>
            )}
          </Stack>

          <GroupBox
            label="ITEM DETAILS"
            variant="flat"
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <GroupBox label="Item Type" variant="flat">
              <P>Backpack</P>
            </GroupBox>

            <GroupBox label="Location" variant="flat">
              <P>{locations[nft?.metadata?.Clique?.toLowerCase() || "geek"]}</P>
            </GroupBox>

            <GroupBox label="Date Found" variant="flat">
              <P>07/27/2022</P>
            </GroupBox>
          </GroupBox>

          <GroupBox label="Guardian Signature" variant="flat">
            <H3>Student guardian’s signature is required to claim item.</H3>

            <Stack
              style={{
                gap: "12px",
                marginTop: "4rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    borderBottom: "3px solid #CCC",
                  }}
                >
                  <P>{shouldFetch && claimedEvent && claimedEvent?.signer}</P>
                </div>
                <P>Signature</P>
              </div>
            </Stack>

            {!shouldFetch && (
              <div
                style={{
                  marginTop: "2rem",
                  paddingBottom: "1rem",
                }}
              >
                <Button
                  onClick={() => {
                    executeTx(claimBackpack({ tokenID: tokenId }));
                  }}
                  fullWidth={"true"}
                >
                  Sign
                </Button>

                {state.txStatus === TX_STATUS.ERROR && (
                  <P
                    style={{
                      color: "red",
                    }}
                  >
                    Something went wrong, please try again..
                  </P>
                )}
              </div>
            )}
          </GroupBox>
        </Frame>
      </ScrollView>
    </div>
  );
};

export default ClaimFormForm;
