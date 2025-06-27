import Head from 'next/head';
import { Button, Toolbar, Window, WindowContent, WindowHeader } from 'react95';
import React from 'react';

const FHSSchoolPage: React.FC = () => (
  <>
    <Head>
      <title>Flunks High School</title>
    </Head>
    <div className="flex flex-col items-center min-h-screen py-8 bg-[#008080] gap-4">
      <Window className="w-full max-w-xl">
        <WindowHeader className="flex justify-between items-center">
          <span>Flunks High School</span>
        </WindowHeader>
        <Toolbar className="flex gap-2 p-2">
          <Button>School Calendar</Button>
          <Button>Staff</Button>
          <Button>Resources</Button>
          <Button>School Map</Button>
        </Toolbar>
        <WindowContent>
          <p>
            Welcome to Flunks High School! This is a fun, fictitious campus
            created for the Flunks community.
          </p>
        </WindowContent>
      </Window>
    </div>
  </>
);

export default FHSSchoolPage;
