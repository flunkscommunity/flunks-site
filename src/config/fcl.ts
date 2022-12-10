import { config } from "@onflow/fcl";

config({
  "discovery.wallet": process.env.NEXT_PUBLIC_DAPPER_WALLET_DISCOVERY,
  "discovery.wallet.method":
    process.env.NEXT_PUBLIC_DAPPER_WALLET_DISCOVERY_METHOD,
  "accessNode.api": process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
  env: process.env.NEXT_PUBLIC_NET_TYPE,
});
