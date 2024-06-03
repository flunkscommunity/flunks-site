import { useMemo } from "react";
import { Frame } from "react95";

const TraitItem = ({ traitName, traitValue }) => {
  return (
    <div className="flex flex-row w-full">
      <Frame
        variant="status"
        className="!flex items-center justify-center w-auto p-2"
      >
        <img
          src={
            traitName === "slots"
              ? `/images/icons/Icon-slots.png`
              : `/images/icons/Icon-${traitName}.png`
          }
          className="flex-shrink-0"
        />
      </Frame>
      <Frame
        variant="status"
        className="w-auto min-w-[40%] px-2 py-1 !flex gap-2 items-center"
      >
        <span className="text-base lg:text-xl capitalize font-bold">{traitName}</span>
      </Frame>
      <Frame variant="status" className="w-full truncate text-wrap !flex items-center px-2 py-1">
        <span className="text-base lg:text-xl capitalize">{traitValue}</span>
      </Frame>
    </div>
  );
};

const TraitSection = ({ metadata }) => {
  const ignoredTraits = useMemo(
    () => ["uri", "pixelUri", "Type", "path", "cid", "mimetype"],
    []
  );

  return (
    <div className="mt-6 flex flex-col px-3 gap-2 max-w-[1440px] mx-auto">
      <span className="text-lg font-bold">TRAITS</span>
      <div className="flex flex-col w-full">
        {Object.entries(metadata).map(([traitName, traitValue]) => {
          if (ignoredTraits.includes(traitName)) return null;

          return (
            <TraitItem
              key={traitName}
              traitName={traitName}
              traitValue={traitValue}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TraitSection;
