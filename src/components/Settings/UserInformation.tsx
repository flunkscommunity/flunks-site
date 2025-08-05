import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import useInitCollection from "hooks/useInitCollection";
import { useEffect } from "react";
import {
  Button,
  Frame,
  GroupBox,
  Hourglass,
  MenuList,
  MenuListItem,
  Separator,
} from "react95";
import ErrorWindow from "windows/ErrorWindow";

const ICONS = {
  blocto: "https://iconic.dynamic-static-assets.com/icons/sprite.svg#blocto",
  dapper: "https://iconic.dynamic-static-assets.com/icons/sprite.svg#dapper",
};

export const InfoItem: React.FC<{
  label: string;
  value: string | React.ReactNode;
}> = (props) => {
  return (
    <div className="flex flex-row flex-wrap gap-x-4">
      <label className="min-w-[150px] text-pretty opacity-80 text-lg">
        {props.label}:
      </label>
      {typeof props.value === "string" && (
        <span className="max-w-fit w-full min-w-[150px] text-pretty text-lg">
          {props.value}
        </span>
      )}
      {typeof props.value !== "string" && props.value}
    </div>
  );
};

const UserInformation = () => {
  const { user, primaryWallet, setShowDynamicUserProfile } =
    useDynamicContext();
  const { isInitialized, initializeCollection, isLoading, error, setError } =
    useInitCollection(primaryWallet?.address);
  const { openWindow, closeWindow } = useWindowsContext();

  useEffect(() => {
    if (!error) {
      closeWindow(WINDOW_IDS.ERROR);
      return;
    }

    openWindow({
      key: WINDOW_IDS.ERROR,
      window: (
        <ErrorWindow
          title="Error Initializing Collection"
          message={error}
          actions={
            <Button
              onClick={() => {
                closeWindow(WINDOW_IDS.ERROR);
                setError(null);
              }}
            >
              Close
            </Button>
          }
          windowId={WINDOW_IDS.ERROR}
          onClose={() => {
            setError(null);
          }}
        />
      ),
    });
  }, [error]);

  return (
    <div className="w-full">
      {!user && (
        <div className="w-full flex items-center justify-center py-8">
          <DynamicConnectButton buttonClassName="w-full">
            <Button className="!w-full !text-xl min-w-[200px] gap-2 flex items-center justify-center">
              <img src="/images/icons/logout.png" width="32px" height="32px" />
              Click above to sign in!
            </Button>
          </DynamicConnectButton>
        </div>
      )}
      {user && (
        <div className="flex flex-col gap-y-3 pb-4 px-4">
          <InfoItem label="Username" value={user.username} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Connected Wallet" value={primaryWallet.address} />
          <InfoItem
            label="Wallet Provider"
            value={primaryWallet.connector.name}
          />
          <div className="flex flex-row items-center flex-wrap gap-x-4">
            <label className="min-w-[150px] text-pretty opacity-80 text-lg">
              Contracts Initialized:
            </label>
            <span className="max-w-fit w-full min-w-[150px] text-pretty text-lg">
              {isInitialized && "Yes"}
              {!isInitialized && (
                <Button
                  disabled={isLoading}
                  size="sm"
                  onClick={initializeCollection}
                >
                  Initialize Collection
                </Button>
              )}
            </span>
          </div>
          <Button
            onClick={() => setShowDynamicUserProfile(true)}
            className="mr-auto !px-10"
          >
            Edit
          </Button>

          <Separator className="!my-4" />

          <div className="flex flex-col">
            <span className="text-pretty text-xl font-bold">
              Verified Wallets
            </span>
            <span className="text-lg max-w-[400px]">
              Verified wallets are wallets you have linked to your email, this
              allows your to easily switch between your wallets. You may not
              sign transactions on behalf of your other wallets, only your
              connected wallet.
            </span>
          </div>

          <div>
            {user.verifiedCredentials.map((credential) => {
              if (!credential.walletName) return null;

              return (
                <div className="flex flex-row w-full max-w-[400px]">
                  <Frame
                    variant="field"
                    key={credential.id}
                    className="!flex items-center gap-3 w-auto px-3 py-2"
                  >
                    <img
                      src={ICONS[credential.walletName]}
                      alt={credential.walletName}
                      className="w-6 h-6"
                    />
                  </Frame>
                  <Frame
                    variant="field"
                    key={credential.id}
                    className="!flex items-center gap-3 w-full px-3 py-2"
                  >
                    <span className="text-lg">{credential.address}</span>
                  </Frame>
                </div>
              );
            })}
          </div>
          <Button
            className="mr-auto !px-10"
            onClick={() => setShowDynamicUserProfile(true)}
          >
            Link another wallet
          </Button>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40">
          <Hourglass />
        </div>
      )}
    </div>
  );
};

export default UserInformation;
