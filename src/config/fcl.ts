import { config } from "@onflow/fcl";

// Use environment variable for Flow network configuration
config({
  "accessNode.api": process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
});
