import { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const FLUNK_CONTRACT = "0x5643fd47a29770e7";
const FLOWTY_MARKET_URL = "https://flowty.io/collection/Flunks";

interface Props {
  onEnter?: () => void;
}

const TreehouseAccess: React.FC<Props> = ({ onEnter }) => {
  const [user, setUser] = useState<any>(null);
  const [hasFlunk, setHasFlunk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  useEffect(() => {
    if (user?.addr) {
      checkFlunkOwnership(user.addr);
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkFlunkOwnership = async (address: string) => {
    try {
      const response = await fcl.query({
        cadence: `
          import Flunks from ${FLUNK_CONTRACT}
          import MetadataViews from 0x1d7e57aa55817448

          pub fun main(address: Address): Bool {
              let acct = getAccount(address)
              let collection = acct.getCapability(Flunks.CollectionPublicPath)
                  .borrow<&{NonFungibleToken.CollectionPublic}>()
                  ?? panic("No collection")
              return collection.getIDs().length > 0
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });

      setHasFlunk(response as boolean);
    } catch (e) {
      console.error("Failed to check Flunk ownership:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading Treehouse...</p>;

  if (!user?.addr) {
    return (
      <div>
        <p>Please login to check Treehouse access:</p>
        <DynamicWidget />
      </div>
    );
  }

  if (!hasFlunk) {
    return (
      <div>
        <p>You need a Flunk NFT to enter the Treehouse.</p>
        <a href={FLOWTY_MARKET_URL} target="_blank" rel="noopener noreferrer">
          <button>Buy a Flunk on Flowty</button>
        </a>
      </div>
    );
  }

  return (
    <div>
      <button className="treehouse-button" onClick={onEnter}>
        Enter the Treehouse
      </button>
    </div>
  );
};

export default TreehouseAccess;
