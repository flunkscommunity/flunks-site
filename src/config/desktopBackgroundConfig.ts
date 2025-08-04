// Desktop Background Configuration for Windows 95 inspired themes
// This controls the main desktop area background (after login)

export interface DesktopBackgroundOption {
  name: string;
  description: string;
  type: 'image' | 'pattern' | 'gradient';
  value: string;
  preview: string;
}

export const DESKTOP_BACKGROUNDS: DesktopBackgroundOption[] = [
  // Classic Windows 95 inspired patterns
  {
    name: "Windows 95 Classic",
    description: "Classic teal and gray geometric pattern",
    type: 'pattern',
    value: `
      background: linear-gradient(45deg, #008080 25%, transparent 25%), 
                  linear-gradient(-45deg, #008080 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #4FD0D0 75%), 
                  linear-gradient(-45deg, transparent 75%, #4FD0D0 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      background-color: #C0C0C0;
    `,
    preview: "/images/backdrops/CYAN.png"
  },
  
  {
    name: "Retro Circuit",
    description: "Circuit board style pattern in classic green",
    type: 'pattern',
    value: `
      background: 
        linear-gradient(90deg, #00FF00 2px, transparent 2px),
        linear-gradient(#00FF00 2px, transparent 2px),
        linear-gradient(45deg, rgba(0,255,0,0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(0,255,0,0.1) 25%, transparent 25%);
      background-size: 40px 40px, 40px 40px, 20px 20px, 20px 20px;
      background-color: #001100;
    `,
    preview: "/images/backdrops/GREEN.png"
  },

  {
    name: "Windows 95 Clouds",
    description: "Soft clouds on blue sky background",
    type: 'pattern',
    value: `
      background: 
        radial-gradient(ellipse at top, #87CEEB 0%, #4169E1 100%),
        radial-gradient(ellipse 800px 200px at 400px 300px, rgba(255,255,255,0.3) 0%, transparent 50%),
        radial-gradient(ellipse 600px 150px at 200px 250px, rgba(255,255,255,0.2) 0%, transparent 50%),
        radial-gradient(ellipse 700px 180px at 600px 200px, rgba(255,255,255,0.25) 0%, transparent 50%);
      background-size: 100% 100%, 800px 400px, 600px 300px, 700px 350px;
      background-position: 0 0, 0 0, 200px 100px, -100px 50px;
    `,
    preview: "/images/backdrops/BLUE-SKY.png"
  },

  {
    name: "Pixelated Grid",
    description: "Retro pixel art style grid pattern",
    type: 'pattern',
    value: `
      background: 
        linear-gradient(90deg, #FF00FF 1px, transparent 1px),
        linear-gradient(#FF00FF 1px, transparent 1px);
      background-size: 16px 16px;
      background-color: #000040;
    `,
    preview: "/images/backdrops/PURPLE.png"
  },

  {
    name: "Matrix Style",
    description: "Digital rain pattern background",
    type: 'pattern',
    value: `
      background: 
        linear-gradient(0deg, transparent 24%, rgba(0,255,0,0.05) 25%, rgba(0,255,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,255,0,0.05) 75%, rgba(0,255,0,0.05) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, rgba(0,255,0,0.05) 25%, rgba(0,255,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,255,0,0.05) 75%, rgba(0,255,0,0.05) 76%, transparent 77%, transparent);
      background-size: 50px 50px;
      background-color: #000000;
    `,
    preview: "/images/backdrops/GREEN-GRADIENT.png"
  },

  // Using existing backdrop images
  {
    name: "Teal Gradient",
    description: "Smooth teal to cyan gradient",
    type: 'image',
    value: "/images/backdrops/CYAN-GRADIENT.png",
    preview: "/images/backdrops/CYAN-GRADIENT.png"
  },

  {
    name: "Blue Gradient", 
    description: "Classic blue gradient background",
    type: 'image',
    value: "/images/backdrops/BLUE-GRADIENT.png",
    preview: "/images/backdrops/BLUE-GRADIENT.png"
  },

  {
    name: "Purple Gradient",
    description: "Rich purple gradient background", 
    type: 'image',
    value: "/images/backdrops/PURPLE-GRADIENT.png",
    preview: "/images/backdrops/PURPLE-GRADIENT.png"
  },

  {
    name: "Rainbow Flocks",
    description: "Colorful abstract pattern",
    type: 'image', 
    value: "/images/backdrops/RAINBOW-FLOCKS.png",
    preview: "/images/backdrops/RAINBOW-FLOCKS.png"
  },

  {
    name: "Cyan Smileys",
    description: "Retro smiley face pattern",
    type: 'image',
    value: "/images/backdrops/CYAN-SMILEYS.png", 
    preview: "/images/backdrops/CYAN-SMILEYS.png"
  }
];

// Default desktop background
export const DEFAULT_DESKTOP_BACKGROUND = DESKTOP_BACKGROUNDS[0]; // Windows 95 Classic

// Quick access to apply a background
export const applyDesktopBackground = (background: DesktopBackgroundOption) => {
  const desktop = document.querySelector('[data-testid="background"]') as HTMLElement;
  if (desktop) {
    if (background.type === 'image') {
      desktop.style.background = `url("${background.value}") center/cover no-repeat`;
    } else if (background.type === 'pattern' || background.type === 'gradient') {
      desktop.style.background = '';
      desktop.style.cssText += background.value;
    }
  }
};
