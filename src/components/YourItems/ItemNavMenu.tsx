import { Handle, MenuList, MenuListItem } from "react95";

interface NavMenu {
  collectionName: string;
  tokenId: number | string;
  onBack: () => void;
}

const NavMenu: React.FC<NavMenu> = ({ onBack, collectionName, tokenId }) => {
  return (
    <MenuList className="!w-full h-auto p-4 !flex !items-center !sticky !top-0 z-20">
      <MenuListItem
        onClick={onBack}
        className="flex flex-row items-center justify-center"
      >
        Back
      </MenuListItem>

      <Handle size={38} />

      <MenuListItem className="ml-auto">
        <a
          href={`https://www.flowty.io/asset/0x807c3d470888cc48/${collectionName}/${tokenId}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          <img src="/images/icons/flowty-outlined.svg" className="h-8 w-auto" />
        </a>
      </MenuListItem>
    </MenuList>
  );
};

export default NavMenu;
