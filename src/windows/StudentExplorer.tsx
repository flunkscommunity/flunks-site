import { CollectionApiInstance } from "api";
import { MarketplaceIndividualNftDto } from "api/generated";
import PaginatedProdiver, {
  usePaginatedContext,
} from "contexts/PaginatedContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Handle, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS, FLUNK_TRAITS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";
import TraitFilters from "./TraitFilters";
import PaginatedNftFrameGrid from "components/PaginatedNftFrameGrid";

const StudentExplorer: React.FC = () => {
  return (
    <PaginatedProdiver
      fetcher={CollectionApiInstance.collectionControllerGetallNftsInACollection.bind(
        CollectionApiInstance
      )}
      cacheKey="flunks-explorer"
      requestParameters={{
        collectionName: "flunks",
        include: "ALL",
        limit: 20,
        sort: "RANK_ASC",
      }}
    >
      <StudentExplorerWindow />
    </PaginatedProdiver>
  );
};

const StudentExplorerWindow = () => {
  const { closeWindow } = useWindowsContext();
  const [showFilters, setShowFilters] = useState(false);
  const { openWindow } = useWindowsContext();
  const { setRequestParameters, requestParameters } =
    usePaginatedContext<MarketplaceIndividualNftDto>();

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Student Directory v0.2"
      authGuard={false}
      windowsId={WINDOW_IDS.STUDENT_EXPLORER}
      onClose={() => {
        closeWindow(WINDOW_IDS.FILTERS_WINDOW);
        closeWindow(WINDOW_IDS.STUDENT_EXPLORER);
      }}
    >
      <SlowProgressBar bgImage="/images/student-directory-bg.png">
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
        <PaginatedNftFrameGrid />
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default StudentExplorer;
