import { Window } from "react95";
import styled from "styled-components";

export default styled(Window)`
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  height: calc(100% - var(--safe-area-inset-bottom));
`;
