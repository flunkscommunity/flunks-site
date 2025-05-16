import React from "react";
import Marquee from "react-fast-marquee";
import { Anchor, Frame, Window, WindowContent, WindowHeader } from "react95";
import { FrameWithBackground } from "./FrameWithBackground";

const Product = ({
  name,
  description,
  image,
}: {
  name: string;
  description: React.ReactNode;
  image: string;
}) => {
  return (
    <div className="w-full flex flex-col gap-3 items-start">
      {/* <div className="px-4 lg:px-20"> */}
      <div className="mx-auto w-full flex flex-col items-start max-w-2xl">
        <span className="text-2xl md:text-4xl font-bold max-w-2xl text-pretty mb-2">
          {name}
        </span>
        <Frame variant="well" className="!p-0 mb-2">
          <img
            src={image}
            alt="Flunk"
            className="w-[250px] h-[250px] lg:w-[300px] lg:h-[300px] object-cover"
          />
        </Frame>
        <span className="max-w-[300px]">{description}</span>
      </div>
      {/* </div> */}
    </div>
  );
};

const TEAM: {
  name: string;
  description: React.ReactNode;
  image: string;
}[] = [
  {
    name: "Skeremy",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Skeremy is the purveyor of vibes in the Flunks universe. He leads the 
        creative direction behind the scenes and has a background in graphic 
        design, drugs and nostalgic. 
      </span>
    ),
    image: "/images/about-us/skeremy.png",
  },
  {
    name: "Nantucket",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Nanny is the one and only glue-sniffin' wanderer of Flunks
        and the greater Web3 realm. With a background in programming and 
        shenanigans, he's going to keep the gears greased and the train on the tracks.
      </span>
    ),
    image: "/images/about-us/Nantucket.png",
  },
];

const OurTeam = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-10 overflow-hidden">
      {TEAM.map((product, index) => (
        <Product key={index} {...product} />
      ))}
    </div>
  );
};

export default OurTeam;
