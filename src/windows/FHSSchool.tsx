import { Button, Toolbar, WindowContent, Separator, Frame } from 'react95';
import React, { useState } from 'react';
import CrowdSimulator from 'components/CrowdSimulator';
import Marquee from "react-fast-marquee";
import { FrameWithBackground } from '../components/AboutUs/FrameWithBackground';

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
    <div className="w-full flex flex-col gap-2 md:gap-3">
      <div className="px-2 md:px-4 lg:px-20">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col">
          <span className="text-2xl md:text-4xl lg:text-6xl font-bold max-w-2xl text-pretty mb-2">
            {title}
          </span>
          <div className="text-sm md:text-lg lg:text-xl">
            {description}
          </div>
        </div>
      </div>
      <FrameWithBackground
        className="!py-2 md:!py-4 overflow-hidden mt-2"
        variant="well"
      >
        <Marquee pauseOnClick autoFill direction={direction}>
          {images.map((image, index) => (
            <Frame key={index} className="!p-1 md:!p-2 ml-2 md:ml-4 !pb-1">
              <Frame
                variant="well"
                className="!p-0 w-[100px] h-[100px] md:w-[150px] md:h-[150px] lg:w-[375px] lg:h-[375px] overflow-hidden"
              >
                <img
                  src={image}
                  alt="Flunk"
                  className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] lg:w-[375px] lg:h-[375px] object-cover bg-gray-200 select-none pointer-events-none"
                  style={{
                    imageRendering: "auto",
                  }}
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
    images: [
      "/images/about-us/fp-1.avif",
      "/images/about-us/fp-2.avif",
      "/images/about-us/fp-3.avif",
      "/images/about-us/fp-4.avif",
      "/images/about-us/fp-5.avif",
      "/images/about-us/fp-6.avif",
      "/images/about-us/fp-7.avif",
      "/images/about-us/fp-8.avif",
      "/images/about-us/fp-9.avif",
      "/images/about-us/fp-10.avif",
    ],
    direction: "left",
  },
  {
    title: "Backpacks",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Backpacks are utility items for Flunk holders. Each backpack comes with
        special abilities and traits that enhance your Flunk's capabilities in
        the metaverse. Collect different backpacks to unlock new features and
        experiences.
      </span>
    ),
    images: [
      "/images/about-us/bp-1.avif",
      "/images/about-us/bp-2.avif",
      "/images/about-us/bp-3.avif",
      "/images/about-us/bp-4.avif",
      "/images/about-us/bp-5.avif",
      "/images/about-us/bp-6.avif",
      "/images/about-us/bp-7.avif",
      "/images/about-us/bp-8.avif",
      "/images/about-us/bp-9.avif",
      "/images/about-us/bp-10.avif",
    ],
    direction: "right",
  },
  {
    title: "Flunk Portraits",
    description: (
      <span className="text-xl md:text-xl max-w-2xl text-pretty">
        Flunk Portraits are premium 2D artwork featuring detailed
        interpretations of popular Flunk characters. These high-quality digital
        art pieces showcase the creativity and artistry behind the Flunk
        universe.
      </span>
    ),
    images: [
      "/images/about-us/f2d-1.avif",
      "/images/about-us/f2d-2.avif",
      "/images/about-us/f2d-3.avif",
      "/images/about-us/f2d-4.avif",
      "/images/about-us/f2d-5.avif",
      "/images/about-us/f2d-6.avif",
      "/images/about-us/f2d-7.avif",
      "/images/about-us/f2d-8.avif",
      "/images/about-us/f2d-9.avif",
      "/images/about-us/f2d-10.avif",
    ],
    direction: "left",
  },
];

interface Props {
  onClose: () => void;
}

const FHSSchool: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMonth, setSelectedMonth] = useState('August');

  const renderCalendarForMonth = (month: string) => {
    const monthData = {
      August: {
        title: 'August 2025',
        color: 'orange',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        events: [
          { day: 28, label: 'First Day of School', color: 'bg-yellow-400' },
          { day: 30, label: 'First Arcade Challenge Begins', color: 'bg-purple-400' }
        ]
      },
      September: {
        title: 'September 2025',
        color: 'green',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        events: [
          { day: 1, label: 'Labor Day', color: 'bg-red-400' },
          { day: 12, label: 'Picture Day', color: 'bg-blue-400' },
          { day: 20, label: 'Homecoming', color: 'bg-pink-400' },
          { day: 27, label: '2nd Arcade Challenge Begins', color: 'bg-purple-400' }
        ]
      },
      October: {
        title: 'October 2025',
        color: 'orange',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        events: [
          { day: 13, label: 'Columbus Day', color: 'bg-red-400' },
          { day: 25, label: '3rd Arcade Challenge Begins', color: 'bg-purple-400' },
          { day: 31, label: 'Halloween', color: 'bg-purple-400' }
        ]
      },
      November: {
        title: 'November 2025',
        color: 'amber',
        borderColor: 'border-amber-600',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        events: [
          { day: 11, label: 'Veterans Day - No School', color: 'bg-red-400' },
          { day: 22, label: '4th Arcade Challenge Begins', color: 'bg-purple-400' },
          { day: 27, label: 'Thanksgiving Break Begins', color: 'bg-orange-400' }
        ]
      },
      December: {
        title: 'December 2025',
        color: 'red',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        events: [
          { day: 1, label: 'Back from Thanksgiving', color: 'bg-green-400' },
          { day: 19, label: 'Winter Break Begins', color: 'bg-green-400' },
          { day: 25, label: 'Christmas Day', color: 'bg-red-500' }
        ]
      }
    };

    const currentMonth = monthData[month as keyof typeof monthData];
    if (!currentMonth) return null;

    return (
      <div className={`bg-white border-2 md:border-4 ${currentMonth.borderColor} rounded-lg p-2 md:p-4 shadow-lg`}>
        <h3 className={`text-center font-bold text-lg md:text-xl mb-2 md:mb-4 ${currentMonth.textColor}`}>{currentMonth.title}</h3>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className={`text-center font-bold text-xs md:text-sm p-1 md:p-2 ${currentMonth.bgColor} rounded`}>
              <span className="hidden sm:inline">{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}</span>
              <span className="sm:hidden">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {(() => {
            // Get the first day of the month and number of days
            const getCalendarData = (month: string) => {
              const year = 2025;
              const monthMap: { [key: string]: number } = {
                'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
              };
              const monthNum = monthMap[month];
              const firstDay = new Date(year, monthNum, 1).getDay(); // 0 = Sunday
              const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
              return { firstDay, daysInMonth };
            };

            const { firstDay, daysInMonth } = getCalendarData(month);
            const totalCells = 42; // 6 rows × 7 days
            
            return Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDay + 1;
              const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
              const hasEvent = currentMonth.events.find(event => event.day === dayNum);
              
              return (
                <div
                  key={i}
                  className={`text-center p-1 md:p-2 rounded border font-bold text-xs md:text-sm ${
                    isValidDay 
                      ? hasEvent 
                        ? `${hasEvent.color} ${currentMonth.textColor}` 
                        : `bg-white ${currentMonth.textColor}`
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  style={{ minHeight: '24px' }}
                >
                  {isValidDay ? dayNum : ''}
                </div>
              );
            });
          })()}
        </div>
        
        {/* Events legend for this month */}
        <div className="mt-2 md:mt-4 space-y-1">
          <h4 className="font-bold text-xs md:text-sm">Events this month:</h4>
          {currentMonth.events.map((event, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs md:text-sm">
              <div className={`w-3 h-3 ${event.color} rounded flex-shrink-0`}></div>
              <span><strong>{event.day}:</strong> {event.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="p-2 md:p-4 space-y-4">
            <h2 className="text-lg md:text-xl font-bold mb-4">📅 School Calendar</h2>
            
            {/* Clickable Month Headers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-6">
              {/* August */}
              <button
                onClick={() => setSelectedMonth('August')}
                className={`text-center p-2 md:p-3 rounded-xl border-2 md:border-4 text-white font-bold text-sm md:text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'August' ? 'ring-2 md:ring-4 ring-yellow-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #FF8C00, #FFD700)',
                  borderColor: '#FF6347',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                🌻 August 🌻
              </button>
              
              {/* September */}
              <button
                onClick={() => setSelectedMonth('September')}
                className={`text-center p-2 md:p-3 rounded-xl border-2 md:border-4 text-white font-bold text-sm md:text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'September' ? 'ring-2 md:ring-4 ring-green-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #32CD32, #98FB98)',
                  borderColor: '#228B22',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                🍂 September 🍂
              </button>
              
              {/* October */}
              <button
                onClick={() => setSelectedMonth('October')}
                className={`text-center p-2 md:p-3 rounded-xl border-2 md:border-4 text-white font-bold text-sm md:text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'October' ? 'ring-2 md:ring-4 ring-orange-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #FF4500, #FFA500)',
                  borderColor: '#FF6347',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                🎃 October 🎃
              </button>
              
              {/* November */}
              <button
                onClick={() => setSelectedMonth('November')}
                className={`text-center p-2 md:p-3 rounded-xl border-2 md:border-4 text-white font-bold text-sm md:text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'November' ? 'ring-2 md:ring-4 ring-amber-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #8B4513, #D2691E)',
                  borderColor: '#A0522D',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                🍁 November 🍁
              </button>
              
              {/* December */}
              <button
                onClick={() => setSelectedMonth('December')}
                className={`text-center p-2 md:p-3 rounded-xl border-2 md:border-4 text-white font-bold text-sm md:text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'December' ? 'ring-2 md:ring-4 ring-red-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #B22222, #32CD32)',
                  borderColor: '#DC143C',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                ❄️ December ❄️
              </button>
            </div>

            {/* Selected Month Calendar */}
            {renderCalendarForMonth(selectedMonth)}

            <div className="bg-white border-2 border-gray-400 p-3 rounded-lg mt-4">
              <h3 className="font-bold text-lg mb-2">📚 All Upcoming School Events:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-orange-600">🌻 August Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 28th: First Day of School</li>
                    <li>• 30th: First Arcade Challenge Begins</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600">🍂 September Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 1st: Labor Day</li>
                    <li>• 12th: Picture Day</li>
                    <li>• 20th: Homecoming</li>
                    <li>• 27th: 2nd Arcade Challenge Begins</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600">🎃 October Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 13th: Columbus Day</li>
                    <li>• 25th: 3rd Arcade Challenge Begins</li>
                    <li>• 31st: Halloween</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-600">🍁 November Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 11th: Veterans Day - No School</li>
                    <li>• 22nd: 4th Arcade Challenge Begins</li>
                    <li>• 27th: Thanksgiving Break Begins</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-red-600">❄️ December Events:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 1st: Back from Thanksgiving</li>
                  <li>• 19th: Winter Break Begins</li>
                  <li>• 25th: Christmas Day</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'staff':
        return (
          <div className="p-2 md:p-4 space-y-4">
            <h2 className="text-lg md:text-xl font-bold mb-4">👨‍🏫 Faculty & Staff</h2>
            
            {/* School Board Section */}
            <div className="bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 border-2 md:border-4 border-purple-500 p-3 md:p-6 shadow-lg">
              <h3 className="font-black text-xl md:text-3xl mb-4 md:mb-6 text-center text-purple-800" style={{
                textShadow: '2px 2px 0px #ff00ff, 3px 3px 0px #00ffff',
                fontFamily: 'Impact, Arial Black, sans-serif'
              }}>
                🌟 SCHOOL BOARD 🌟
              </h3>
              
              <div className="grid grid-cols-1 gap-4 md:gap-8">
                {/* Skeremy */}
                <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-2 md:border-4 border-red-500 p-3 md:p-6 rounded-lg shadow-xl">
                  <div className="flex flex-col md:flex-row items-start gap-3 md:gap-6">
                    <div className="w-24 h-24 md:w-40 md:h-40 border-2 md:border-4 border-blue-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg mx-auto md:mx-0">
                      <img 
                        src="/images/about-us/skeremy.png" 
                        alt="Skeremy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-lg md:text-3xl text-red-700 mb-2 md:mb-3" style={{
                        textShadow: '1px 1px 0px #ffff00, 2px 2px 0px #ff00ff',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        SKEREMY
                      </h4>
                      <p className="text-sm md:text-lg text-gray-900 font-bold leading-relaxed">
                        Skeremy is the purveyor of vibes in the Flunks universe. He leads the creative 
                        direction behind the scenes and has a background in graphic design, drugs 
                        and nostalgia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nantucket */}
                <div className="bg-gradient-to-r from-green-300 to-teal-300 border-2 md:border-4 border-purple-500 p-3 md:p-6 rounded-lg shadow-xl">
                  <div className="flex flex-col md:flex-row items-start gap-3 md:gap-6">
                    <div className="w-24 h-24 md:w-40 md:h-40 border-2 md:border-4 border-pink-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg mx-auto md:mx-0">
                      <img 
                        src="/images/about-us/Nantucket.png" 
                        alt="Nantucket"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-lg md:text-3xl text-purple-700 mb-2 md:mb-3" style={{
                        textShadow: '1px 1px 0px #00ff00, 2px 2px 0px #ff0066',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        NANTUCKET
                      </h4>
                      <p className="text-sm md:text-lg text-gray-900 font-bold leading-relaxed">
                        Nanny is the one and only glue-sniffin' wanderer of Flunks and the greater 
                        Web3 realm. With a background in programming and shenanigans, he's 
                        going to keep the gears greased and the train on the tracks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DOLO */}
                <div className="bg-gradient-to-r from-blue-300 to-indigo-300 border-2 md:border-4 border-orange-500 p-3 md:p-6 rounded-lg shadow-xl">
                  <div className="flex flex-col md:flex-row items-start gap-3 md:gap-6">
                    <div className="w-24 h-24 md:w-40 md:h-40 border-2 md:border-4 border-green-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg mx-auto md:mx-0">
                      <img 
                        src="/images/about-us/dolo.png" 
                        alt="DOLO"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-lg md:text-3xl text-orange-700 mb-2 md:mb-3" style={{
                        textShadow: '1px 1px 0px #0066ff, 2px 2px 0px #ffff00',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        DOLO
                      </h4>
                      <p className="text-sm md:text-lg text-gray-900 font-bold leading-relaxed">
                        DOLO is the hall-passin' drifter of Flunks—never tied down, always in 
                        the mix. With a background in digital marketing, writing, and UX, he turns 
                        ideas into moments that connect, land, and leave an impression.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Handy */}
                <div className="bg-gradient-to-r from-pink-300 to-rose-300 border-2 md:border-4 border-cyan-500 p-3 md:p-6 rounded-lg shadow-xl">
                  <div className="flex flex-col md:flex-row items-start gap-3 md:gap-6">
                    <div className="w-24 h-24 md:w-40 md:h-40 border-2 md:border-4 border-yellow-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg mx-auto md:mx-0">
                      <img 
                        src="/images/about-us/Handy.png" 
                        alt="Handy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-lg md:text-3xl text-cyan-700 mb-2 md:mb-3" style={{
                        textShadow: '1px 1px 0px #ff6600, 2px 2px 0px #00ff99',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        HANDY
                      </h4>
                      <p className="text-sm md:text-lg text-gray-900 font-bold leading-relaxed">
                        Handy is a multi-talented artist with a background in illustration and 3D 
                        modeling. He created the art assets for the Flunks Portraits collection, Pocket 
                        Juniors, Flunks 3D, and contributes to the broader Flunks ecosystem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 border-2 border-blue-400 p-3 text-sm md:text-base">
              <p><strong>📞 Main Office:</strong> (555) FHS-MAIN</p>
              <p><strong>🕐 Office Hours:</strong> 7:30 AM - 4:00 PM</p>
            </div>
          </div>
        );
      
      case 'resources':
        return (
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold mb-4">🎨 Flunk Art Galleries</h2>
            
            {PRODUCTS.map((product, index) => (
              <Product
                key={index}
                title={product.title}
                description={product.description}
                images={product.images}
                direction={product.direction}
              />
            ))}
          </div>
        );
      
      default: // home
        return (
          <div className="p-4 space-y-4">
            {/* Hero Section with Complementary Gradient and 8-bit Mascot */}
            <div 
              className="text-white p-6 border-4 border-gray-400 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(139, 90, 150, 0.9) 0%, rgba(155, 111, 163, 0.8) 25%, rgba(168, 132, 176, 0.7) 50%, rgba(181, 153, 189, 0.6) 75%, rgba(194, 174, 202, 0.5) 100%)`,
                backdropFilter: 'blur(10px)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              {/* Pixel Art Astro Mascot */}
              <div className="flex justify-center mb-4">
                <img 
                  src="/images/icons/astro-mascot.png" 
                  alt="Astro Mascot"
                  className="w-20 h-24"
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 0 10px rgba(255, 105, 180, 0.5))',
                    animation: 'floatLeftRight 4s ease-in-out infinite'
                  }}
                />
              </div>
              
              {/* CSS Animation Styles */}
              <style jsx>{`
                @keyframes floatLeftRight {
                  0% {
                    transform: translateX(-15px);
                  }
                  50% {
                    transform: translateX(15px);
                  }
                  100% {
                    transform: translateX(-15px);
                  }
                }
              `}</style>
              <h1 className="text-4xl font-bold mb-2">FLUNKS</h1>
              <h2 className="text-2xl font-bold mb-2">HIGH SCHOOL</h2>
              <p className="text-xl">🚀 Home of the Astros 🚀</p>
              <p className="text-lg mt-2">⭐ Reach for the Stars ⭐</p>
            </div>

            {/* News & Announcements */}
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="text-xl font-bold mb-3 text-red-600 text-center md:text-left">📢 Latest News & Announcements</h2>
              
              <div className="space-y-3">
                <div className="border-l-4 border-purple-500 pl-3 text-center md:text-left">
                  <h3 className="font-bold">🚀 Meet Our Mascot: The Astro!</h3>
                  <p className="text-sm">Our pink space-suited astronaut represents the Flunks High spirit of reaching for the stars! Go Astros!</p>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-blue-500 pl-3 text-center md:text-left">
                  <h3 className="font-bold">🎉 Welcome Back Students!</h3>
                  <p className="text-sm">The new school year is off to a great start! Don't forget to pick up your student handbooks from the main office.</p>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-green-500 pl-3 text-center md:text-left">
                  <h3 className="font-bold">💾 Web3 Innovation at Flunks!</h3>
                  <p className="text-sm">Flunks is a web3 brand that blends high school nostalgia with the excitement of NFTs and modern technology.</p>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-purple-500 pl-3 text-center md:text-left">
                  <h3 className="font-bold">💻 Laser Focused Community Leadership</h3>
                  <p className="text-sm">Founded in 2022 by web3 enthusiasts, Flunks has weathered the storm and is now run by a devoted team with a specific vision for the brand.</p>
                </div>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-100 border-2 border-yellow-400 p-3 text-center">
                <h3 className="font-bold text-lg">📞 Contact Info</h3>
                <p className="text-sm mt-2">
                  <strong>Phone:</strong> (555) FHS-MAIN<br/>
                  <strong>E-mail:</strong> Flunkshigh@gmail.com
                </p>
              </div>
              
              <div className="bg-green-100 border-2 border-green-400 p-3 text-center">
                <h3 className="font-bold text-lg">🕐 School Hours</h3>
                <p className="text-sm mt-2">
                  <strong>Classes:</strong><br/>8:00 AM - 2:30 PM<br/>
                  <strong>Office:</strong><br/>7:30 AM - 4:00 PM<br/>
                  <strong>Library:</strong><br/>7:00 AM - 6:00 PM
                </p>
              </div>
              
              <div className="bg-blue-100 border-2 border-blue-400 p-3 text-center">
                <h3 className="font-bold text-lg">📊 Quick Stats</h3>
                <p className="text-sm mt-2">
                  <strong>Students:</strong> 1,738<br/>
                  <strong>Teachers:</strong> not enough<br/>
                  <strong>Established:</strong> 1986<br/>
                  <strong>Graduation Rate:</strong> 69%
                </p>
              </div>
            </div>

            {/* School Community Characters */}
            <div className="bg-white border-2 border-gray-400 p-4 text-center">
              <h2 className="text-xl font-bold mb-3">🎓 Our School Community</h2>
              <p className="text-sm mb-3 text-gray-700 text-center">
                Meet the vibrant students and staff that make Flunks High School special! 
                Watch them move around our virtual campus below.
              </p>
              <div className="relative bg-gradient-to-b from-blue-100 to-green-100 border-2 border-gray-300 rounded overflow-hidden">
                <CrowdSimulator
                  spriteSheetUrl="/images/Footer-Crowd.webp"
                  rows={8}
                  cols={2}
                />
              </div>
            </div>

            {/* Bottom Counter - Very 90s! */}
            <div className="bg-black text-green-400 p-2 text-center font-mono text-sm border-2 border-gray-400">
              <p>👁️ You are visitor number: 001,337 | Created in the 90's</p>
              <p className="text-xs mt-1">Best viewed with Netscape Navigator 4.0 or Internet Explorer 4.0</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      style={{
        background: `linear-gradient(180deg, #8B5A96 0%, #9B6FA3 15%, #A884B0 30%, #B599BD 45%, #C2AECA 60%, #CFC3D7 75%, #DCD8E4 85%, #E9D5D1 92%, #F5D2BE 96%, #FFCFAB 100%)`,
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Toolbar className="flex flex-col md:flex-row gap-2 p-2 md:p-4 justify-center">
        <Button 
          onClick={() => setActiveTab('home')}
          style={{ 
            backgroundColor: activeTab === 'home' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'home' ? 'bold' : undefined,
            padding: '8px 12px',
            fontSize: '14px',
            minWidth: '80px',
            height: '36px',
            width: '100%'
          }}
          className="md:w-auto"
        >
          🏠 Home
        </Button>
        <Button 
          onClick={() => setActiveTab('calendar')}
          style={{ 
            backgroundColor: activeTab === 'calendar' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'calendar' ? 'bold' : undefined,
            padding: '8px 12px',
            fontSize: '14px',
            minWidth: '90px',
            height: '36px',
            width: '100%'
          }}
          className="md:w-auto"
        >
          📅 Calendar
        </Button>
        <Button 
          onClick={() => setActiveTab('staff')}
          style={{ 
            backgroundColor: activeTab === 'staff' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'staff' ? 'bold' : undefined,
            padding: '8px 12px',
            fontSize: '14px',
            minWidth: '80px',
            height: '36px',
            width: '100%'
          }}
          className="md:w-auto"
        >
          👨‍🏫 Staff
        </Button>
        <Button 
          onClick={() => setActiveTab('resources')}
          style={{ 
            backgroundColor: activeTab === 'resources' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'resources' ? 'bold' : undefined,
            padding: '8px 12px',
            fontSize: '14px',
            minWidth: '100px',
            height: '36px',
            width: '100%'
          }}
          className="md:w-auto"
        >
          📚 Resources
        </Button>
      </Toolbar>
      <WindowContent 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0
        }} 
        className="p-2 md:p-4"
      >
        {renderContent()}
      </WindowContent>
    </div>
  );
};

export default FHSSchool;
