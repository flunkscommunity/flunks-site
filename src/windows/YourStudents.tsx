import { CollectionApiInstance, UsersApiInstance } from "api";
import { MarketplaceIndividualNftDto } from "api/generated";
import PaginatedProdiver, {
  usePaginatedContext,
} from "contexts/PaginatedContext";
import NftFrameGrid from "components/NftFrameGrid";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Handle, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS, FLUNK_TRAITS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";
import Filters from "components/Filters";
import TraitFilters from "./TraitFilters";

const StudentExplorer: React.FC = () => {
  return (
    <PaginatedProdiver
      fetcher={UsersApiInstance.usersControllerGetUserNftsByWalletAddress.bind(
        UsersApiInstance
      )}
      cacheKey="users-wallet-explorer"
      requestParameters={{
        walletAddress: "0x0",
      }}
    >
      <UsersStudentExplorerWindow />
    </PaginatedProdiver>
  );
};

const UsersStudentExplorerWindow = () => {
  const { closeWindow } = useWindowsContext();
  const [showFilters, setShowFilters] = useState(false);
  const { openWindow } = useWindowsContext();
  const { setRequestParameters, requestParameters } =
    usePaginatedContext<MarketplaceIndividualNftDto>();

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Student Directory v0.2"
      onClose={() => {
        closeWindow(WINDOW_IDS.FILTERS_WINDOW);
        closeWindow(WINDOW_IDS.STUDENT_EXPLORER);
      }}
    >
      <SlowProgressBar>
        <Toolbar
          style={{
            justifyContent: "end",
            gap: "0.5rem",
          }}
        >
          <Handle size={35} />
          <Button
            variant="raised"
            onClick={() => {
              openWindow({
                key: WINDOW_IDS.FILTERS_WINDOW,
                window: (
                  <TraitFilters
                    requestParameters={
                      requestParameters as Record<string, unknown>
                    }
                    setRequestParameters={setRequestParameters}
                    filters={FLUNK_TRAITS}
                  />
                ),
              });
            }}
          >
            Filters
          </Button>
          <Handle size={35} />
        </Toolbar>
        <NftFrameGrid />
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default StudentExplorer;
