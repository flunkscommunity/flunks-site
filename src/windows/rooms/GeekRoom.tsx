import Head from "next/head";
// import GeekRoom from "../../../rooms/GeekRoom";
import GeekRoom from "./GeekRoom"; // Update this path if the file is in the same directory, otherwise adjust accordingly
/* No additional code needed here, as the import path for GeekRoom is now correct. */
const GeekPage = () => (
  <>
    <Head>
      <title>Geek Room | Flunks</title>
    </Head>
    <GeekRoom />
  </>
);

export default GeekPage;