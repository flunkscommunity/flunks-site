import { Button, Frame, GroupBox, Hourglass } from "react95";
import styled from "styled-components";
import { Metadata } from "types/NFT";
import { H1, H3, P } from "components/Typography";
import { useEffect, useMemo, useState } from "react";
import { useBackpackClaimed } from "contexts/BackpackClaimContext";
import { useFclTransactionContext } from "contexts/FclTransactionContext";
import { TX_STATUS } from "reducers/TxStatusReducer";
import { claimBackpack } from "web3/tx-claim-backpack";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { MarketplaceIndividualNftDto } from "generated/models";
import { NftItem } from "components/YourItems/ItemsGrid";
import { ObjectDetails } from "contexts/StakingContext";

interface Props {
  nft: ObjectDetails & { pixelUrl: string };
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

export const ImageWithBackground = styled.img`
  background-color: ${({ theme }) => theme.material};
  background-image: url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='40' height='40' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M15 22h10m-10-4h10M35 2h10M35 38h10m-50 0H5M-5 2H5'  stroke-linecap='square' stroke-width='1.5' stroke='hsla(259, 0%, 100%, 0.24)' fill='none'/><path d='M18-5V5m4-10V5m16 10v10M18 35v10m4-10v10M2 15v10'  stroke-linecap='square' stroke-width='1.5' stroke='hsla(340, 0%, 100%, 0.56)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>");
`;

const ClaimFormForm: React.FC<Props> = (props) => {
  const { nft, shouldFetch } = props;
  const {
    MetadataViewsDisplay: metadata,
    serialNumber: templateId,
    tokenID: tokenId,
  } = nft;
  const { url: uri } = metadata.thumbnail;
  const { flunksData, refreshClaimData } = useBackpackClaimed();
  const [claimedItem, setClaimedItem] = useState<MarketplaceIndividualNftDto>();

  const { executeTx, state, resetState } = useFclTransactionContext();
  const [loading, setLoading] = useState(false);

  const claimedEvent =
    flunksData && flunksData[tokenId] ? flunksData[tokenId] : null;

  useEffect(() => {
    if (!claimedEvent) return;

    setLoading(true);
    setTimeout(
      () =>
        collectionControllerGetNftByCollectionNameAndTokenId(
          "backpack",
          Number(claimedEvent.backpackTokenID)
        )
          .then((res) => {
            setClaimedItem(res.data);
          })
          .finally(() => {
            setLoading(false);
          }),
      1000
    );
  }, [claimedEvent]);

  useEffect(() => {
    if (state.txStatus === TX_STATUS.SUCCESS) {
      refreshClaimData();
    }
  }, [state]);

  const locations = {
    geek: "Computer lab",
    jock: "Gym",
    freak: "School Shed",
    prep: "Courtyard",
  };

  const _traitsObject = useMemo(() => {
    return nft.traits.traits.reduce((acc, trait) => {
      acc[trait.name] = trait.value;
      return acc;
    }, {});
  }, [nft.traits]);

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
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {(state.txStatus === TX_STATUS.STARTED ||
        state.txStatus === TX_STATUS.PENDING) && (
        <div className="fixed inset-0 w-full h-full bg-black/60 flex flex-col gap-2 items-center justify-center z-20">
          <Hourglass />
          <span className="text-white">
            Sit tight, transactions can take a minute.
          </span>
        </div>
      )}
      <CustomStyledScrollView
        style={{
          overflow: "auto",
          padding: 0,
        }}
      >
        <CustomScrollArea>
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
                <Frame variant="field">
                  <img src={uri} alt="flunk" width="250px" height="250px" />
                </Frame>
                <GroupBox
                  label="STUDENT"
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
                  <Frame variant="field">
                    <ImageWithBackground
                      src={claimedItem?.metadata?.uri}
                      alt="flunk"
                      width="250px"
                      height="250px"
                    />
                  </Frame>
                  <GroupBox
                    label="CLAIMED ITEM"
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
                    {!loading && (
                      <H1
                        style={{
                          fontSize: "6rem",
                          fontWeight: "normal",
                        }}
                      >
                        ?
                      </H1>
                    )}
                    {loading && <Hourglass />}
                  </Frame>
                  <GroupBox
                    label="CLAIMED ITEM"
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

            <div
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <GroupBox label="ITEM" variant="flat">
                <P>Backpack</P>
              </GroupBox>

              <GroupBox label="LOCATION" variant="flat">
                <P>{locations[_traitsObject?.Clique?.toLowerCase() || "geek"]}</P>
              </GroupBox>

              {/* <GroupBox label="Date Found" variant="flat">
              <P>07/27/2022</P>
            </GroupBox> */}
            </div>

            <GroupBox label="GUARDIAN SIGNATURE" variant="flat">
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
                    <P>
                      <span className="opacity-50">X</span>{" "}
                      {claimedEvent && claimedEvent?.signer}
                    </P>
                  </div>
                  <P>Signature</P>
                </div>
              </Stack>

              {!claimedItem && !loading && (
                <div
                  style={{
                    marginTop: "2rem",
                    paddingBottom: "1rem",
                  }}
                >
                  <Button
                    onClick={() => {
                      executeTx(claimBackpack({ tokenID: Number(tokenId) }));
                    }}
                    fullWidth
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
        </CustomScrollArea>
      </CustomStyledScrollView>
    </div>
  );
};

export default ClaimFormForm;
