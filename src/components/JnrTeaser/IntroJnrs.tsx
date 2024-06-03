import { FrameWithBackground } from "components/AboutUs/FrameWithBackground";
import Marquee from "react-fast-marquee";
import { Frame } from "react95";

const IMAGES = [
  "/images/about-us/jnr-1.webp",
  "/images/about-us/jnr-2.webp",
  "/images/about-us/jnr-3.webp",
  "/images/about-us/jnr-8.webp",
  "/images/about-us/jnr-4.webp",
  "/images/about-us/jnr-5.webp",
  "/images/about-us/jnr-6.webp",
  "/images/about-us/jnr-7.webp",
  "/images/about-us/jnr-9.webp",
  "/images/about-us/jnr-10.webp",
];

const IntroJnrs = () => {
  return (
    <FrameWithBackground
      className="py-4 overflow-hidden pt-[80px] !flex flex-col gap-[112px]"
      variant="well"
    >
      <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
        Introducing Pocket Juniors (J.N.R) <br /> The coolest craze to hit the
        schoolyard! <br />{" "}
        <span className="text-xl lg:text-3xl font-normal">
          *💥 cue explosion sound 💥*
        </span>
      </span>
      <Marquee pauseOnClick autoFill direction={"left"}>
        {IMAGES.map((image, index) => (
          <Frame key={index} className="!p-2 ml-4 !pb-1">
            <Frame
              variant="well"
              className="!p-0 w-[150px] h-[150px] lg:w-[375px] lg:h-[375px] overflow-hidden"
            >
              <img
                src={image}
                alt="Flunk"
                className="w-[150px] h-[150px] lg:w-[375px] lg:h-[375px] object-cover bg-gray-200"
                style={{
                  imageRendering: "auto",
                }}
              />
            </Frame>
          </Frame>
        ))}
      </Marquee>
    </FrameWithBackground>
  );
};

export default IntroJnrs;
