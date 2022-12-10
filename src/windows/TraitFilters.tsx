import { MarketplaceIndividualNftDto } from "api/generated";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import Filters from "components/Filters";
import { usePaginatedContext } from "contexts/PaginatedContext";
import { useWindowsContext } from "contexts/WindowsContext";
import { FLUNK_TRAITS, WINDOW_IDS } from "fixed";
import { useEffect, useState } from "react";
import { Button, Handle, Toolbar } from "react95";

interface Props {
  filters: typeof FLUNK_TRAITS;
  requestParameters: Record<string, unknown>;
  setRequestParameters: (requestParameters: unknown) => void;
}

const TraitFilters: React.FC<Props> = (props) => {
  const { filters, requestParameters, setRequestParameters } = props;
  const { closeWindow } = useWindowsContext();
  const [traits, setTraits] = useState<Record<string, string[]>>(null!);

  const handleTraitSelect = (category: string, trait: string) => {
    if (traits === null) {
      setTraits({
        [category]: [trait],
      });
      return;
    }

    if (traits[category] && traits[category].includes(trait)) {
      setTraits({
        ...traits,
        [category]: traits[category].filter((t) => t !== trait),
      });
    } else {
      setTraits({
        ...traits,
        [category]: [...(traits[category] || []), trait],
      });
    }
  };

  const handleReset = () => {
    setTraits({});
  };

  useEffect(() => {
    if (traits === null) return;
    setRequestParameters({
      ...requestParameters,
      traits: JSON.stringify(traits),
    });
  }, [traits]);

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(WINDOW_IDS.FILTERS_WINDOW);
      }}
      headerTitle={`Filter Students`}
      initialHeight="40%"
      initialWidth="40%"
    >
      <Toolbar
        style={{
          justifyContent: "end",
          gap: "0.5rem",
        }}
      >
        <Handle size={35} />
        <Button variant="raised" onClick={handleReset}>
          Reset
        </Button>
        <Handle size={35} />
      </Toolbar>
      <Filters
        filters={filters}
        traits={traits || {}}
        onTraitSelect={handleTraitSelect}
      />
    </DraggableResizeableWindow>
  );
};

export default TraitFilters;
