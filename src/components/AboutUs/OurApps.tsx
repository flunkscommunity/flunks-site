import React from "react";
import Marquee from "react-fast-marquee";
import { Anchor, Frame, Window, WindowContent, WindowHeader } from "react95";
import { FrameWithBackground } from "./FrameWithBackground";

const Product = ({
  title,
  description,
  href,
}: {
  title: string;
  description: React.ReactNode;
  href?: string;
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="px-4 lg:px-20">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col">
          {title !== "Flunks.io (you are here 📍)" && (
            <span className="text-2xl md:text-4xl font-bold max-w-2xl text-pretty mb-2">
              {title}
            </span>
          )}
          {title === "Flunks.io (you are here 📍)" && (
            <div className="flex flex-row items-start gap-2">
              <span className="text-2xl md:text-4xl font-bold max-w-2xl text-pretty mb-2">
                {title.slice(0, 10)}
              </span>
              <span className="text-lg md:text-xl font-bold max-w-2xl text-pretty mb-2">
                (you are here 📍)
              </span>
            </div>
          )}

          {description}

          {href && (
            <Anchor
              href={href}
              className="!py-4 overflow-hidden mt-2 !text-2xl mr-auto"
            >
              Visit {href}
            </Anchor>
          )}
        </div>
      </div>
    </div>
  );
};

const PRODUCTS: {
  title: string;
  description: React.ReactNode;
  href?: string;
}[] = [
  {
    title: "Flunks.io (you are here 📍)",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        The powerhouse of the Flunks ecosystem, this Windows 95-inspired website
        is the central hub for all things Flunks. As a collector, you’ll spend
        most of your time here, viewing your collection, earning $GUM, and
        spending it in the Flunk-E-Mart on exclusive digital and physical items.
      </span>
    ),
  },
];

const OurApps = () => {
  return (
    <div className="flex flex-col gap-20 mt-10 overflow-hidden">
      {PRODUCTS.map((product, index) => (
        <Product key={index} {...product} />
      ))}
    </div>
  );
};

export default OurApps;
