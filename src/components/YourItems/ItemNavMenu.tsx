import { Button, Handle, MenuList, MenuListItem } from "react95";

interface NavMenu {
  collectionName: string;
  tokenId: number | string;
  templateId: number;
  onBack: () => void;
  extraButtons?: React.ReactNode;
}

const NavMenu: React.FC<NavMenu> = (props) => {
  return (
    <MenuList className="!w-full h-auto !px-2 !py-2 !flex !items-center justify-end">
      {props.extraButtons}
      {props.extraButtons && <Handle className="!h-9 mx-1" />}
      <a
        href={`https://www.flowty.io/asset/0x807c3d470888cc48/${props.collectionName}/${props.tokenId}`}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center"
      >
        <Button className="w-full">
          <img src="/images/icons/flowty.png" className="h-6 w-auto" />
        </Button>
      </a>
    </MenuList>
  );
};

export default NavMenu;
