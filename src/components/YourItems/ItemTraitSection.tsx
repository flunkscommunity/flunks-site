import { useMemo } from "react";
import { Frame } from "react95";

const TraitItem = ({ traitName, traitValue }) => {
  return (
    <div className="flex flex-row w-full">
      <Frame
        variant="status"
        className="w-auto min-w-[50%] px-2 py-1 !flex gap-2"
      >
        <img
          src={`/images/icons/Icon-${traitName}.png`}
          className="h-6 lg:h-8 w-auto"
        />
        <span className="text-base lg:text-xl capitalize">{traitName}</span>
      </Frame>
      <Frame variant="status" className="w-full truncate text-nowrap px-2 py-1">
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
    <div className="mt-6 flex flex-col px-3 gap-2">
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