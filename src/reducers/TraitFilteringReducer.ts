export type AppliedFilters = {
  [key in string]: string[];
};

export interface TraitFilteringReducerState {
  traits: AppliedFilters;
  traitFilterCount: number;
}

export interface TraitFilteringReducerActions {
  type: "ADD_TRAIT" | "REMOVE_TRAIT" | "SET_TRAITS" | "RESET";
  payload?: {
    traitCategory?: string;
    traitValue?: string;
    traits?: AppliedFilters;
  };
}

const TraitFilteringReducer = (
  state: TraitFilteringReducerState,
  action: TraitFilteringReducerActions
) => {
  const { type, payload } = action;
  const { traitCategory: category, traitValue: value, traits } = payload || {};

  const handleReset = () => {
    return initTraitFiltering({
      traits: {},
      traitFilterCount: 0,
    });
  };

  switch (type) {
    case "ADD_TRAIT": {
      if (!category || !value) {
        return state;
      }

      const appliedFilters = state.traits;

      if (appliedFilters[category]) {
        const newFilters = new Set([...appliedFilters[category], value]);
        appliedFilters[category] = [...newFilters];
      } else {
        appliedFilters[category] = [value];
      }

      return {
        ...state,
        traits: appliedFilters,
        traitFilterCount: state.traitFilterCount + 1,
      };
    }
    case "REMOVE_TRAIT": {
      if (!category || !value) {
        return state;
      }

      const appliedFilters = { ...state.traits };
      if (appliedFilters[category]) {
        appliedFilters[category] = appliedFilters[category].filter(
          (v) => v !== value
        );
      }

      if (appliedFilters[category].length === 0) {
        delete appliedFilters[category];
      }

      return {
        ...state,
        traits: appliedFilters,
        traitFilterCount: state.traitFilterCount - 1,
      };
    }
    case "SET_TRAITS": {
      if (!traits) {
        return state;
      }

      const traitFilterCount = Object.values(traits || {}).reduce(
        (acc, curr) => acc + curr.length,
        0
      );

      return {
        ...state,
        traits,
        traitFilterCount,
      };
    }
    case "RESET": {
      return handleReset();
    }
    default:
      return state;
  }
};

export const initTraitFiltering = (
  initialState: TraitFilteringReducerState
): TraitFilteringReducerState => {
  const { traits } = initialState;

  const traitFilterCount = Object.values(traits || {}).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  return {
    traits: traits || {},
    traitFilterCount,
  };
};

export default TraitFilteringReducer;
