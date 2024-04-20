import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import useInitCollection from "hooks/useInitCollection";
import { useEffect } from "react";
import { Button, Frame, GroupBox, Hourglass } from "react95";
import ErrorWindow from "windows/ErrorWindow";

const ICONS = {
  blocto: "https://iconic.dynamic-static-assets.com/icons/sprite.svg#blocto",
  dapper: "https://iconic.dynamic-static-assets.com/icons/sprite.svg#dapper",
};

export const InfoItem: React.FC<{ label: string; value: string }> = (props) => {
  return (
    <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
      <label className="min-w-[150px] text-pretty opacity-50">
        {props.label}:
      </label>
      <span className="max-w-fit w-full min-w-[150px] text-pretty">
        {props.value}
      </span>
    </div>
  );
};

const UserInformation = () => {
  const { user, primaryWallet } = useDynamicContext();
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
    <div className="!mx-2 lg:!mx-5 lg:!mt-4 !mt-2 !mb-3">
      {!user && (
        <div className="w-full h-full flex items-center justify-center">
          <Hourglass />
        </div>
      )}
      {user && (
        <div className="flex flex-col gap-y-3 pb-4">
          <InfoItem label="Username" value={user.username} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="User Identifier" value={user.userId} />
          <InfoItem label="Connected Wallet" value={primaryWallet.address} />
          <InfoItem
            label="Wallet Provider"
            value={primaryWallet.connector.name}
          />
          <div className="flex flex-row items-center flex-wrap gap-y-1.5 gap-x-4">
            <label className="min-w-[150px] text-pretty opacity-50">
              Contracts Initialized:
            </label>
            <span className="max-w-fit w-full min-w-[150px] text-pretty">
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
          <span className="text-pretty opacity-50">Verified Wallets</span>

          {user.verifiedCredentials.map((credential) => {
            if (!credential.walletName) return null;

            return (
              <GroupBox
                variant="flat"
                label={credential.walletName || credential.format}
                key={credential.id}
                className="flex items-center gap-4 max-w-[300px] w-full"
              >
                <img
                  src={ICONS[credential.walletName]}
                  alt={credential.walletName}
                  className="w-4 h-4"
                />
                <span className="mt-1">{credential.address}</span>
              </GroupBox>
            );
          })}
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
