import Head from "next/head";

export default function FlunksHub() {
  return (
    <>
      <Head>
        <title>Flunks Hub</title>
        <meta name="description" content="Welcome to the Flunks Hub." />
      </Head>
      <div className="p-10 text-white text-center">
        <h1 className="text-3xl font-bold">🧠 Flunks Hub</h1>
        <p className="mt-4 text-lg">Everything you need, all in one place.</p>
      </div>
    </>
  );
}