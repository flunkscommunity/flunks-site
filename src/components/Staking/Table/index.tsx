import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUsersControllerGetUserNftsByWalletAddress } from "generated/api/users/users";
import { Table, TableBody, TableHead, TableRow } from "react95";
import RowItem from "./RowItem";

const CustomTableHeadCell = styled(TableHeadCell)`
  flex: 1 0 0%;
`;
const CustomTableDataCell = styled(TableDataCell)`
  flex: 1 0 0%;
  display: flex;
  items-align: center;
  justify-content: center;
`;

const NftTable = () => {
  const { primaryWallet } = useDynamicContext();

  const { data } = useUsersControllerGetUserNftsByWalletAddress(
    primaryWallet.address
  );

  const flunks = data?.data?.Flunks;
  const backpacks = data?.data?.Backpack;

  return (
    <div className="[&>*:first-child]:!w-full [&>*:first-child]:before:!border-none flex w-full">
      <Table className="!h-full !flex !flex-col !w-full !flex-1">
        <TableHead className="!h-auto !w-full !flex-1">
          <TableRow className="!flex !items-center !w-full">
            <CustomTableHeadCell disabled className="flex-grow">
              Item
            </CustomTableHeadCell>
            {/* <CustomTableHeadCell className="flex-grow">Collection</CustomTableHeadCell> */}
            <CustomTableHeadCell disabled className="flex-grow">
              Earned
            </CustomTableHeadCell>
            <CustomTableHeadCell disabled className="flex-grow">
              Earning?
            </CustomTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="!h-full !flex !flex-col !w-full">
          {flunks?.map((flunk) => (
            <RowItem
              prettyCollection="Flunks"
              collectionName={flunk.collectionName}
              image={flunk.metadata.uri ?? flunk.metadata.pixelUri}
              tokenId={flunk.tokenId}
              key={`${flunk.collectionName}-${flunk.tokenId}`}
            />
          ))}
          {backpacks?.map((backpack) => (
            <RowItem
              prettyCollection="Backpack"
              collectionName={backpack.collectionName}
              image={backpack.metadata.uri ?? backpack.metadata.pixelUri}
              tokenId={backpack.tokenId}
              key={`${backpack.collectionName}-${backpack.tokenId}`}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};