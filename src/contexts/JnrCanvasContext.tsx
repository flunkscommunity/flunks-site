import { JnrTrait, USERS_TRAITS, UserTraits } from "mocks/jnr-traits";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// import { authenticate, unauthenticate, currentUser } from "@onflow/fcl";
import useUserStore from "store/useUserStore";

interface JnrCanvasContextProps {
  ownedTraits: UserTraits;
  selectedTraits: {
    back: JnrTrait;
    bottoms: JnrTrait;
    head: JnrTrait;
    lh: JnrTrait;
    rh: JnrTrait;
    shoes: JnrTrait;
    torso: JnrTrait;
  };
  equipTrait: (trait: JnrTrait, group: string) => void;
  randomizeSelectedTraits: () => void;
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
  const [selectedTraits, setSelectedTraits] = useState(
    ChooseRandomSelectedTraits(data)
  );

  const equipTrait = useCallback((trait: JnrTrait, group: string) => {
    console.log("equipTrait", trait, group);
    setSelectedTraits((prev) => ({ ...prev, [group]: trait }));
  }, []);

  const randomizeSelectedTraits = useCallback(() => {
    setSelectedTraits(ChooseRandomSelectedTraits(data));
  }, [data]);

  return (
    <JnrCanvasContext.Provider
      value={{
        ownedTraits: data,
        selectedTraits,
        equipTrait,
        randomizeSelectedTraits,
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
