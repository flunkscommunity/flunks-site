import { FLUNK_TRAITS } from "fixed";
import { Fragment, useState } from "react";
import { Checkbox, GroupBox, ScrollView } from "react95";

interface Props {
  filters: typeof FLUNK_TRAITS;
  traits: Record<string, string[]>;
  onTraitSelect: (category: string, trait: string) => void;
}

const Filters: React.FC<Props> = (props) => {
  const { filters, traits = {}, onTraitSelect } = props;
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleExpandCollapse = (key: string) => {
    if (expanded.includes(key)) {
      setExpanded(expanded.filter((item) => item !== key));
    } else {
      setExpanded([...expanded, key]);
    }
  };

  return (
    <ScrollView
      style={{
        height: "100%",
      }}
    >
      <GroupBox
        label="Traits"
        style={{
          margin: "20px 8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Object.entries(filters).map(([key, value]) => {
          return (
            <Fragment key={key}>
              <Checkbox
                onChange={() => {
                  handleExpandCollapse(key);
                }}
                label={key}
              />
              <div
                style={{
                  paddingLeft: "16px",
                  flexDirection: "column",
                  whiteSpace: "nowrap",
                  display: expanded.includes(key) ? "flex" : "none",
                }}
              >
                {Object.keys(value).map((trait) => {
                  return (
                    <Checkbox
                      value={trait}
                      label={trait}
                      onChange={() => {
                        onTraitSelect(key, trait);
                      }}
                      style={{
                        fontWeight: "light",
                      }}
                      checked={!!traits[key]?.includes(trait)}
                    />
                  );
                })}
              </div>
            </Fragment>
          );
        })}
      </GroupBox>
    </ScrollView>
  );
};

export default Filters;
