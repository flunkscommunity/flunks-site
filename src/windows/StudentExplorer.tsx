import { CollectionApiInstance } from "api";
import instance from "api/axios";
import { MarketplaceIndividualNftDto } from "api/generated";
import { AxiosRequestConfig } from "axios";
import PaginatedProdiver, {
  usePaginatedContext,
} from "contexts/PaginatedContext";
import NFT from "types/NFT";
import NftFrameGrid from "components/NftFrameGrid";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { AppBar, Button, Handle, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "constants";

const StudentExplorer: React.FC = () => {
  return (
    <PaginatedProdiver
      fetcher={CollectionApiInstance.collectionControllerGetallNftsInACollection.bind(
        CollectionApiInstance
      )}
      cacheKey="flunks-explorer"
      requestParameters={{
        collectionName: "flunks",
        page: 0,
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
  const { nfts, page, setPage, hasMore } =
    usePaginatedContext<MarketplaceIndividualNftDto>();
  const { closeWindow } = useWindowsContext();

  if (!nfts) {
    return null;
  }

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="student-explorer.exe"
      onClose={() => closeWindow(WINDOW_IDS.STUDENT_EXPLORER)}
    >
      <Toolbar
        style={{
          justifyContent: "end",
          gap: "0.5rem",
        }}
      >
        <Handle size={35} />
        <Button variant="raised">Filter</Button>
        <Button
          variant="raised"
          onClick={() => {
            setPage(page + 1);
          }}
        >
          Load More
        </Button>
        <Handle size={35} />
      </Toolbar>
      <NftFrameGrid nfts={nfts || []} />
    </DraggableResizeableWindow>
  );
};

export default StudentExplorer;
