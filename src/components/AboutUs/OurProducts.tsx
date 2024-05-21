import React from "react";
import Marquee from "react-fast-marquee";
import { Frame, Window, WindowContent, WindowHeader } from "react95";
import { FrameWithBackground } from "./FrameWithBackground";

const Product = ({
  title,
  description,
  images,
  direction,
}: {
  title: string;
  description: React.ReactNode;
  images: string[];
  direction: "left" | "right";
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="px-4 lg:px-20">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col">
          <span className="text-2xl md:text-4xl font-bold max-w-2xl text-pretty mb-2">
            {title}
          </span>

          {description}
        </div>
      </div>
      <FrameWithBackground
        className="!py-4 overflow-hidden mt-2"
        variant="well"
      >
        <Marquee autoFill direction={direction}>
          {images.map((image, index) => (
            <Frame key={index} className="!p-2 ml-4 !pb-1">
              <Frame variant="well" className="!p-0 w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] overflow-hidden">
                <img
                  src={image}
                  alt="Flunk"
                  className="w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] object-cover scale-105"
                />
              </Frame>
            </Frame>
          ))}
        </Marquee>
      </FrameWithBackground>
    </div>
  );
};

const PRODUCTS: {
  title: string;
  description: React.ReactNode;
  images: string[];
  direction: "left" | "right";
}[] = [
  {
    title: "Flunk Originals",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Flunk Originals is a collection of 10K unique pixel art characters. Each
        Flunk is composed of seven layers of traits: Backdrop, Face, Torso,
        Pigment, Superlative, Clique, and Head. With over 1 million possible
        combinations, every Flunk is one-of-a-kind and programmatically
        generated.
      </span>
    ),
    images: ["https://via.placeholder.com/250"],
    direction: "left",
  },
  {
    title: "Backpacks",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Backpacks is a collection of 10K unique items discovered in the school's
        Lost and Found by each Flunk owner. Featuring forty base designs, each
        backpack has three traits with over 20 different pattern and color
        combinations.
        <br />
        <br />
        Each Flunk can claim one backpack for free. This is a one-time process,
        no duplicates allowed!
      </span>
    ),
    images: ["https://via.placeholder.com/250"],
    direction: "right",
  },
  {
    title: "Flunk Portraits",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Flunk Portraits are a re-imagining of the Flunk Originals. Each trait
        from the Originals collection has been meticulously redrawn in four
        variations to match the Clique (Geek, Freak, Jock, and Prep) of the
        Flunk.
        <br />
        <br />
        Each Flunk can undergo a Graduation Ceremony to update their artwork
        from Original to Portrait. This is a one-time process that cannot be
        reversed, but both versions are stored in the metadata, preserving both
        pieces of art.
      </span>
    ),
    images: ["https://via.placeholder.com/250"],
    direction: "left",
  },
  {
    title: "Pocket Juniors (Coming Soon)",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        The latest craze at Flunks High: Pocket Juniors (or JNRs). These 3D
        models, dressed (by you) to represent different school subjects, are
        becoming the must-have companions on campus, sure to deplete your $GUM
        reserves.
        <br />
        <br />
        More details coming soon. 👀
      </span>
    ),
    images: ["https://via.placeholder.com/250"],
    direction: "right",
  },
  {
    title: "Flunks 3D (Coming Soon)",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Flunks 3D is a further evolution of the Flunks brand. These 3D models
        will be available with a variety of traits and accessories, allowing
        collectors to create unique and personalized models.
        <br />
        <br />
        More details coming soon. 👀
      </span>
    ),
    images: [
      "/images/about-us/f3d-1.webp",
      "/images/about-us/f3d-2.webp",
      "/images/about-us/f3d-3.webp",
      "/images/about-us/f3d-4.webp",
      "/images/about-us/f3d-5.webp",
      "/images/about-us/f3d-6.webp",
      "/images/about-us/f3d-7.webp",
      "/images/about-us/f3d-8.webp",
      "/images/about-us/f3d-9.webp",
      "/images/about-us/f3d-10.webp",
    ],
    direction: "left",
  },
];

const OurProducts = () => {
  return (
    <div className="flex flex-col gap-20 mt-10 overflow-hidden">
      {PRODUCTS.map((product, index) => (
        <Product key={index} {...product} />
      ))}
    </div>
  );
};

export default OurProducts;
