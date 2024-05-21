import { Handle, MenuList, MenuListItem } from "react95";

interface NavMenu {
  collectionName: string;
  tokenId: number | string;
  templateId: number;
  onBack: () => void;
}

const NavMenu: React.FC<NavMenu> = ({ onBack, collectionName, tokenId }) => {
  return (
    <MenuList className="!w-full h-auto p-4 !flex !items-center">
      <MenuListItem
        onClick={onBack}
        className="flex flex-row items-center justify-center"
      >
        Back
      </MenuListItem>

      <MenuListItem className="ml-auto">
        <a
          href={`https://www.flowty.io/asset/0x807c3d470888cc48/${collectionName}/${tokenId}`}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center"
        >
          <img src="/images/icons/flowty.png" className="h-8 w-auto" />
        </a>
      </MenuListItem>
    </MenuList>
  );
};

export default NavMenu;
