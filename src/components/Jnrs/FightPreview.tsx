import { SelectedTraits, useJnrCanvas } from "contexts/JnrCanvasContext";
import { Button, Frame, MenuList, ScrollView } from "react95";
import Full2DJnr, { Class } from "./Full2DJnr";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { useMemo, useState } from "react";
import { OwnedTrait, OwnedTraitAlt } from "./Inventory";
import { simulateFight } from "scripts/simulate-fight";
import { CLASS_TO_BG_COLOR } from "./JnrCollectibleCard";
import { CLASSES } from "windows/ProjectJnr";

/*
attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    crit?: number;
    hit?: number;
    dodge?: number;
*/

const STATS = [
  { name: "Health", stat: "health" },
  { name: "Attack", stat: "attack" },
  // { name: "Defense", stat: "defense" },
  // { name: "Speed", stat: "speed" },
  // { name: "Crit", stat: "crit" },
  // { name: "Hit", stat: "hit" },
  // { name: "Dodge", stat: "dodge" },
];

const PERCENTAGE_STATS = ["crit", "hit", "dodge"];

const JnrCard = ({
  selectedTraits,
  name,
  onAddJnr,
  jnrClass,
}: {
  selectedTraits?: SelectedTraits;
  name?: string;
  onAddJnr?: () => void;
  jnrClass: Class;
}) => {
  const statsCombined = useMemo(() => {
    if (!selectedTraits) return {};
    return Object.values(selectedTraits).reduce(
      (acc, trait) => {
        if (!trait) return acc;
        const stats = trait.stats;
        return {
          attack: acc.attack + (stats.attack || 0),
          defense: acc.defense + (stats.defense || 0),
          speed: acc.speed + (stats.speed || 0),
          health: acc.health + (stats.health || 0),
          crit: acc.crit + (stats.crit || 0),
          hit: acc.hit + (stats.hit || 0),
          dodge: acc.dodge + (stats.dodge || 0),
        };
      },
      {
        attack: 10,
        defense: 0,
        speed: 0,
        health: 20,
        crit: 0,
        hit: 0,
        dodge: 0,
      }
    );
  }, [selectedTraits]);

  if (!selectedTraits)
    return (
      <Frame className="!flex flex-col w-1/3 min-w-[250px] overflow-hidden !flex-shrink-0">
        <Button onClick={onAddJnr} className="!w-full !h-full !text-3xl">
          Add a JNR
        </Button>
      </Frame>
    );

  return (
    <Frame className="!flex flex-col w-1/3 min-w-[250px] overflow-hidden p-4 !flex-shrink-0">
      <div className="w-full flex flex-col h-full">
        <div className="min-h-[150px] lg:min-h-[300px]">
          <Full2DJnr
            selectedTraits={selectedTraits}
            jnrClass={jnrClass}
            withBackground
            backgroundColor={CLASS_TO_BG_COLOR[jnrClass]}
          />
        </div>
        <Frame variant="well" className="w-full !flex flex-col p-2">
          <span className="text-lg lg:text-2xl font-bold text-center pb-2">
            {name}
          </span>
          {STATS.map((stat) => (
            <Frame
              key={`${name}-${stat.stat}`}
              variant="well"
              className="!flex items-center justify-between p-1 lg:p-2"
            >
              <span className="lg:text-2xl">{stat.name}</span>
              <span className="lg:text-2xl">
                {statsCombined[stat.stat]}
                {PERCENTAGE_STATS.includes(stat.stat) ? "%" : ""}
              </span>
            </Frame>
          ))}
        </Frame>
      </div>
    </Frame>
  );
};

const FightPreview = () => {
  const { selectedTraits, createRandomJnr, selectedClass } = useJnrCanvas();
  const [yourJnrs, setYourJnrs] = useState<SelectedTraits[]>([]);

  const handleAddJnr = () => {
    setYourJnrs((prev) => [...prev, createRandomJnr()]);
  };

  const randomClasses = useMemo(
    () => [
      CLASSES[Math.floor(Math.random() * CLASSES.length)].className,
      CLASSES[Math.floor(Math.random() * CLASSES.length)].className,
      CLASSES[Math.floor(Math.random() * CLASSES.length)].className,
      CLASSES[Math.floor(Math.random() * CLASSES.length)].className,
    ],
    []
  );

  return (
    <CustomStyledScrollView className="!p-0 !overflow-hidden max-w-[1440px] mx-auto w-full">
      <CustomScrollArea className="!p-0">
        <div className="w-full !flex !flex-nowrap">
          <JnrCard
            selectedTraits={selectedTraits}
            name={`Your Future J.N.R #${1}`}
            jnrClass={selectedClass as Class}
          />
          {yourJnrs.map((jnr, index) => (
            <JnrCard
              key={index}
              selectedTraits={jnr}
              name={`Your Future J.N.R #${index + 2}`}
              jnrClass={randomClasses[index] as Class}
            />
          ))}
          {yourJnrs.length <= 1 && <JnrCard onAddJnr={handleAddJnr} />}
        </div>
      </CustomScrollArea>
    </CustomStyledScrollView>
  );
};

export default FightPreview;
