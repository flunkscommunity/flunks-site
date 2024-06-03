import { JnrTrait, USERS_TRAITS, UserTraits } from "mocks/jnr-traits";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CLASSES } from "windows/ProjectJnr";

export interface SelectedTraits {
  back: JnrTrait;
  bottoms: JnrTrait;
  head: JnrTrait;
  lh: JnrTrait;
  rh: JnrTrait;
  shoes: JnrTrait;
  torso: JnrTrait;
}

interface JnrCanvasContextProps {
  ownedTraits: UserTraits;
  selectedTraits: SelectedTraits;
  equipTrait: (trait: JnrTrait, group: string) => void;
  randomizeSelectedTraits: () => void;
  createRandomJnr: () => SelectedTraits;
  selectedClass: string;
  statsCombined: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
    crit: number;
    hit: number;
    dodge: number;
  };
}

const JnrCanvasContext = React.createContext<JnrCanvasContextProps>({
  ownedTraits: null,
  selectedTraits: {
    back: null,
    bottoms: null,
    head: null,
    lh: null,
    rh: null,
    shoes: null,
    torso: null,
  },
  equipTrait: () => {},
  randomizeSelectedTraits: () => {},
  createRandomJnr: () => ({
    back: null,
    bottoms: null,
    head: null,
    lh: null,
    rh: null,
    shoes: null,
    torso: null,
  }),
  selectedClass: "",
  statsCombined: {
    attack: 0,
    defense: 0,
    speed: 0,
    health: 0,
    crit: 0,
    hit: 0,
    dodge: 0,
  },
});

const ChooseRandomSelectedTraits = (ownedTraits: UserTraits) => {
  const randomTrait = (group: string) => {
    // randomly select a class
    const randomClass =
      ownedTraits[Object.keys(ownedTraits)[Math.floor(Math.random() * 8)]];

    return randomClass.find((trait) => trait.group === group);
  };

  return {
    back: randomTrait("back"),
    bottoms: randomTrait("bottoms"),
    head: randomTrait("head"),
    lh: randomTrait("lh"),
    rh: randomTrait("rh"),
    shoes: randomTrait("shoes"),
    torso: randomTrait("torso"),
  };
};

export const JnrCanvasProvider = ({ children }) => {
  const data = USERS_TRAITS;
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>(
    ChooseRandomSelectedTraits(data)
  );

  const equipTrait = useCallback((trait: JnrTrait, group: string) => {
    setSelectedTraits((prev) => ({ ...prev, [group]: trait }));
  }, []);

  const randomizeSelectedTraits = useCallback(() => {
    setSelectedTraits(ChooseRandomSelectedTraits(data));
  }, [data]);

  const createRandomJnr = useCallback(() => {
    return ChooseRandomSelectedTraits(data);
  }, [data]);

  const randomClass = useMemo(
    () => CLASSES[Math.floor(Math.random() * CLASSES.length)].className,
    []
  );

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
        attack: 20,
        defense: 0,
        speed: 0,
        health: 40,
        crit: 0,
        hit: 0,
        dodge: 0,
      }
    );
  }, [selectedTraits]);

  return (
    <JnrCanvasContext.Provider
      value={{
        ownedTraits: data,
        selectedTraits,
        equipTrait,
        randomizeSelectedTraits,
        createRandomJnr,
        selectedClass: randomClass,
        statsCombined,
      }}
    >
      {children}
    </JnrCanvasContext.Provider>
  );
};

export const useJnrCanvas = () => {
  const state = useContext(JnrCanvasContext);

  return state;
};
