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
    name: "Alfred",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Alfred is a smart contract wizard with an extensive background in
        blockchain technology. As a co-founder of Flunks, he is responsible for
        developing the smart contracts and the backend systems that power the
        Flunks ecosystem.
      </span>
    ),
    image: "/images/about-us/alfred.png",
  },
  {
    name: "Ben",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Ben is the creative director of Flunks, overseeing the visual identity
        of the ecosystem. With a background in graphic design and various
        creative roles, he is also the mind behind the innovative ideas driving
        Flunks.
      </span>
    ),
    image: "/images/about-us/ben.png",
  },
  {
    name: "Eric",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Eric is a marketing professional with expertise in digital marketing and
        content creation. As a co-founder of Flunks, he manages marketing and
        community engagement for the Flunks ecosystem.
      </span>
    ),
    image: "/images/about-us/buddsy.png",
  },
  {
    name: "Ervin",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Ervin is a software engineer with a passion for blockchain technology.
        He specializes in web and 3D development. As a co-founder of Flunks, he
        develops the front-facing side of the ecosystem and served as the artist
        for the Flunks Originals collection.
      </span>
    ),
    image: "/images/about-us/ervin.png",
  },
  {
    name: "Gerald",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Gerald is a software engineer with a background in front-end
        development. He is responsible for developing the Flunks website,
        ensuring it is functional and user-friendly.
      </span>
    ),
    image: "/images/about-us/gerald.png",
  },
  {
    name: "Maddy",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Maddy manages the office operations, partnership, hiring, and
        contractual agreements. She is the glue that holds the Flunks team
        together, ensuring everything runs smoothly behind the scenes.
      </span>
    ),
    image: "/images/about-us/maddy.png",
  },
  {
    name: "Tom",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Tom is a multi-talented artist with a background in illustration and 3D
        modeling. He created the art assets for the Flunks Portraits collection,
        Pocket Juniors, Flunks 3D, and contributes to the broader Flunks
        ecosystem.
      </span>
    ),
    image: "/images/about-us/tom.png",
  },
  {
    name: "Victor",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Victor is a talented UX/UI designer passionate about creating beautiful
        and user-friendly interfaces. He is responsible for the usability and
        design of the Flunks ecosystem.
      </span>
    ),
    image: "/images/about-us/victor.png",
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
