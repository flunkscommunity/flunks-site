import { Button, Toolbar, WindowContent, Separator } from 'react95';
import React, { useState } from 'react';
import CrowdSimulator from 'components/CrowdSimulator';

interface Props {
  onClose: () => void;
}

const FHSSchool: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMonth, setSelectedMonth] = useState('August');

  const renderCalendarForMonth = (month: string) => {
    const monthData = {
      August: {
        title: 'August 2024',
        color: 'orange',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        events: [
          { day: 5, label: 'First Day of School', color: 'bg-yellow-400' },
          { day: 15, label: 'Back to School Night', color: 'bg-pink-400' },
          { day: 26, label: 'Student Orientation', color: 'bg-blue-400' }
        ]
      },
      September: {
        title: 'September 2024',
        color: 'green',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        events: [
          { day: 15, label: 'Homecoming Dance', color: 'bg-purple-400' },
          { day: 20, label: 'Football vs. Riverside', color: 'bg-red-400' },
          { day: 30, label: 'Picture Day', color: 'bg-blue-400' }
        ]
      },
      October: {
        title: 'October 2024',
        color: 'orange',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        events: [
          { day: 1, label: 'Parent-Teacher Conferences', color: 'bg-yellow-400' },
          { day: 15, label: 'Fall Break Begins', color: 'bg-green-400' },
          { day: 31, label: 'Halloween Dance', color: 'bg-purple-400' }
        ]
      },
      November: {
        title: 'November 2024',
        color: 'amber',
        borderColor: 'border-amber-600',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        events: [
          { day: 5, label: 'Academic Awards', color: 'bg-yellow-400' },
          { day: 11, label: 'Veterans Day - No School', color: 'bg-red-400' },
          { day: 25, label: 'Thanksgiving Break', color: 'bg-orange-400' }
        ]
      },
      December: {
        title: 'December 2024',
        color: 'red',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        events: [
          { day: 10, label: 'Winter Concert', color: 'bg-blue-400' },
          { day: 20, label: 'Winter Break Begins', color: 'bg-green-400' },
          { day: 25, label: 'Christmas Day', color: 'bg-red-500' }
        ]
      }
    };

    const currentMonth = monthData[month as keyof typeof monthData];
    if (!currentMonth) return null;

    return (
      <div className={`bg-white border-4 ${currentMonth.borderColor} rounded-lg p-4 shadow-lg`}>
        <h3 className={`text-center font-bold text-xl mb-4 ${currentMonth.textColor}`}>{currentMonth.title}</h3>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className={`text-center font-bold text-sm p-2 ${currentMonth.bgColor} rounded`}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days - simplified for demo */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const dayNum = i - 3; // Adjust start day
            const isValidDay = dayNum > 0 && dayNum <= 31;
            const hasEvent = currentMonth.events.find(event => event.day === dayNum);
            
            return (
              <div
                key={i}
                className={`text-center p-2 rounded border font-bold ${
                  isValidDay 
                    ? hasEvent 
                      ? `${hasEvent.color} ${currentMonth.textColor}` 
                      : `bg-white ${currentMonth.textColor}`
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isValidDay ? dayNum : ''}
              </div>
            );
          })}
        </div>
        
        {/* Events legend for this month */}
        <div className="mt-4 space-y-1">
          <h4 className="font-bold text-sm">Events this month:</h4>
          {currentMonth.events.map((event, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 ${event.color} rounded`}></div>
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
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">📅 School Calendar</h2>
            
            {/* Clickable Month Headers */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {/* August */}
              <button
                onClick={() => setSelectedMonth('August')}
                className={`text-center p-3 rounded-xl border-4 text-white font-bold text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'August' ? 'ring-4 ring-yellow-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #FF8C00, #FFD700)',
                  borderColor: '#FF6347',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                🌻 August 🌻
              </button>
              
              {/* September */}
              <button
                onClick={() => setSelectedMonth('September')}
                className={`text-center p-3 rounded-xl border-4 text-white font-bold text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'September' ? 'ring-4 ring-green-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #32CD32, #98FB98)',
                  borderColor: '#228B22',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                🍂 September 🍂
              </button>
              
              {/* October */}
              <button
                onClick={() => setSelectedMonth('October')}
                className={`text-center p-3 rounded-xl border-4 text-white font-bold text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'October' ? 'ring-4 ring-orange-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #FF4500, #FFA500)',
                  borderColor: '#FF6347',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                🎃 October 🎃
              </button>
              
              {/* November */}
              <button
                onClick={() => setSelectedMonth('November')}
                className={`text-center p-3 rounded-xl border-4 text-white font-bold text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'November' ? 'ring-4 ring-amber-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #8B4513, #D2691E)',
                  borderColor: '#A0522D',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                🍁 November 🍁
              </button>
              
              {/* December */}
              <button
                onClick={() => setSelectedMonth('December')}
                className={`text-center p-3 rounded-xl border-4 text-white font-bold text-lg shadow-lg transition-all hover:scale-105 ${
                  selectedMonth === 'December' ? 'ring-4 ring-red-300' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, #B22222, #32CD32)',
                  borderColor: '#DC143C',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
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
                    <li>• 5th: First Day of School</li>
                    <li>• 15th: Back to School Night</li>
                    <li>• 26th: Student Orientation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600">🍂 September Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 15th: Homecoming Dance</li>
                    <li>• 20th: Football vs. Riverside</li>
                    <li>• 30th: Picture Day</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600">🎃 October Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 1st: Parent-Teacher Conferences</li>
                    <li>• 15th: Fall Break Begins</li>
                    <li>• 31st: Halloween Dance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-600">🍁 November Events:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 5th: Academic Awards</li>
                    <li>• 11th: Veterans Day - No School</li>
                    <li>• 25th: Thanksgiving Break</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-red-600">❄️ December Events:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 10th: Winter Concert</li>
                  <li>• 20th: Winter Break Begins</li>
                  <li>• 25th: Christmas Day</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'staff':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">👨‍🏫 Faculty & Staff</h2>
            
            {/* School Board Section */}
            <div className="bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 border-4 border-purple-500 p-6 shadow-lg">
              <h3 className="font-black text-3xl mb-6 text-center text-purple-800" style={{
                textShadow: '3px 3px 0px #ff00ff, 6px 6px 0px #00ffff',
                fontFamily: 'Impact, Arial Black, sans-serif'
              }}>
                🌟 SCHOOL BOARD 🌟
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skeremy */}
                <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-4 border-red-500 p-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-start gap-6">
                    <div className="w-40 h-40 border-4 border-blue-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-us/skeremy.png" 
                        alt="Skeremy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-3xl text-red-700 mb-3" style={{
                        textShadow: '2px 2px 0px #ffff00, 4px 4px 0px #ff00ff',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        SKEREMY
                      </h4>
                      <p className="text-lg text-gray-900 font-bold leading-relaxed">
                        Skeremy is the purveyor of vibes in the Flunks universe. He leads the creative 
                        direction behind the scenes and has a background in graphic design, drugs 
                        and nostalgia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nantucket */}
                <div className="bg-gradient-to-r from-green-300 to-teal-300 border-4 border-purple-500 p-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-start gap-6">
                    <div className="w-40 h-40 border-4 border-pink-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-us/Nantucket.png" 
                        alt="Nantucket"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-3xl text-purple-700 mb-3" style={{
                        textShadow: '2px 2px 0px #00ff00, 4px 4px 0px #ff0066',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        NANTUCKET
                      </h4>
                      <p className="text-lg text-gray-900 font-bold leading-relaxed">
                        Nanny is the one and only glue-sniffin' wanderer of Flunks and the greater 
                        Web3 realm. With a background in programming and shenanigans, he's 
                        going to keep the gears greased and the train on the tracks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DOLO */}
                <div className="bg-gradient-to-r from-blue-300 to-indigo-300 border-4 border-orange-500 p-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-start gap-6">
                    <div className="w-40 h-40 border-4 border-green-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-us/dolo.png" 
                        alt="DOLO"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-3xl text-orange-700 mb-3" style={{
                        textShadow: '2px 2px 0px #0066ff, 4px 4px 0px #ffff00',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        DOLO
                      </h4>
                      <p className="text-lg text-gray-900 font-bold leading-relaxed">
                        DOLO is the hall-passin' drifter of Flunks—never tied down, always in 
                        the mix. With a background in digital marketing, writing, and UX, he turns 
                        ideas into moments that connect, land, and leave an impression.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Handy */}
                <div className="bg-gradient-to-r from-pink-300 to-rose-300 border-4 border-cyan-500 p-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-start gap-6">
                    <div className="w-40 h-40 border-4 border-yellow-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-us/Handy.png" 
                        alt="Handy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-3xl text-cyan-700 mb-3" style={{
                        textShadow: '2px 2px 0px #ff6600, 4px 4px 0px #00ff99',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}>
                        HANDY
                      </h4>
                      <p className="text-lg text-gray-900 font-bold leading-relaxed">
                        Handy is a multi-talented artist with a background in illustration and 3D 
                        modeling. He created the art assets for the Flunks Portraits collection, Pocket 
                        Juniors, Flunks 3D, and contributes to the broader Flunks ecosystem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 border-2 border-blue-400 p-3">
              <p><strong>📞 Main Office:</strong> (555) FHS-MAIN</p>
              <p><strong>🕐 Office Hours:</strong> 7:30 AM - 4:00 PM</p>
            </div>
          </div>
        );
      
      case 'resources':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">📚 Student Resources</h2>
            
            <div className="bg-white border-2 border-gray-400 p-3">
              <h3 className="font-bold text-lg mb-3">📖 Academic Resources:</h3>
              <ul className="space-y-2">
                <li>• <strong>Library Hours:</strong> Mon-Fri 7:00 AM - 6:00 PM</li>
                <li>• <strong>Computer Lab:</strong> Available during study hall</li>
                <li>• <strong>Tutoring Center:</strong> Room 205, after school</li>
                <li>• <strong>Guidance Counselors:</strong> Available by appointment</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-400 p-3">
              <h3 className="font-bold text-lg mb-3">🎓 Student Life:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong>🏆 Clubs & Activities:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• Student Government</li>
                    <li>• Drama Club</li>
                    <li>• Chess Club</li>
                    <li>• Yearbook Committee</li>
                    <li>• Science Olympiad</li>
                  </ul>
                </div>
                <div>
                  <strong>🚀 Astros Sports Teams:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• Astros Football (Fall)</li>
                    <li>• Astros Basketball (Winter)</li>
                    <li>• Astros Baseball/Softball (Spring)</li>
                    <li>• Astros Track & Field</li>
                    <li>• Astros Volleyball</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-100 border-2 border-green-400 p-3">
              <h3 className="font-bold">📋 Important Forms:</h3>
              <p>Pick up forms at the main office or guidance counselor</p>
              <ul className="mt-2">
                <li>• Class Schedule Changes</li>
                <li>• College Application Information</li>
                <li>• Field Trip Permission Slips</li>
              </ul>
            </div>
          </div>
        );
      
      case 'map':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">🏫 School Map & Campus Info</h2>
            
            <div className="bg-white border-2 border-gray-400 p-3">
              <h3 className="font-bold text-lg mb-3">🗺️ Campus Layout:</h3>
              <div className="bg-gray-200 border border-gray-400 p-4 text-center">
                <p className="text-lg font-bold">[SCHOOL MAP PLACEHOLDER]</p>
                <p className="text-sm mt-2">Interactive campus map will be displayed here</p>
                <p className="text-xs text-gray-600 mt-1">Upload your school layout image</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-400 p-3">
                <h3 className="font-bold mb-2">🏢 Building Directory:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>A Wing:</strong> Main Office, Classrooms 101-120</li>
                  <li>• <strong>B Wing:</strong> Science Labs, Classrooms 201-220</li>
                  <li>• <strong>C Wing:</strong> Library, Computer Lab</li>
                  <li>• <strong>Gymnasium:</strong> PE Classes, Sports Events</li>
                  <li>• <strong>Cafeteria:</strong> Lunch served 11 AM - 1 PM</li>
                  <li>• <strong>Auditorium:</strong> Assemblies, Drama Productions</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-gray-400 p-3">
                <h3 className="font-bold mb-2">🚌 Transportation:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Bus Routes:</strong> See main office for schedules</li>
                  <li>• <strong>Student Parking:</strong> North lot, permit required</li>
                  <li>• <strong>Visitor Parking:</strong> Front entrance</li>
                  <li>• <strong>Drop-off Zone:</strong> Circle drive in front</li>
                </ul>
                
                <h3 className="font-bold mb-2 mt-4">🕐 Bell Schedule:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• 1st Period: 8:00 - 8:50 AM</li>
                  <li>• 2nd Period: 9:00 - 9:50 AM</li>
                  <li>• 3rd Period: 10:00 - 10:50 AM</li>
                  <li>• Lunch: 11:00 - 11:30 AM</li>
                  <li>• 4th Period: 11:40 - 12:30 PM</li>
                  <li>• 5th Period: 12:40 - 1:30 PM</li>
                  <li>• 6th Period: 1:40 - 2:30 PM</li>
                </ul>
              </div>
            </div>
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
              <h1 className="text-3xl font-bold mb-2">🏫 FLUNKS HIGH SCHOOL</h1>
              <p className="text-xl">Home of the Astros 🚀</p>
              <p className="text-lg mt-2">Excellence in Education Since 1985</p>
            </div>

            {/* News & Announcements */}
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="text-xl font-bold mb-3 text-red-600">📢 Latest News & Announcements</h2>
              
              <div className="space-y-3">
                <div className="border-l-4 border-purple-500 pl-3">
                  <h3 className="font-bold">🚀 Meet Our Mascot: The Astro!</h3>
                  <p className="text-sm">Our pink space-suited astronaut represents the Flunks High spirit of reaching for the stars! Go Astros!</p>
                  <span className="text-xs text-gray-600">Posted: August 1, 1999</span>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-bold">🎉 Welcome Back Students!</h3>
                  <p className="text-sm">The new school year is off to a great start! Don't forget to pick up your student handbooks from the main office.</p>
                  <span className="text-xs text-gray-600">Posted: August 27, 1998</span>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-green-500 pl-3">
                  <h3 className="font-bold">💾 Web3 Innovation at Flunks!</h3>
                  <p className="text-sm">Flunks is a web3 brand that blends high school nostalgia with the excitement of NFTs and modern technology.</p>
                  <span className="text-xs text-gray-600">Posted: August 15, 1998</span>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-purple-500 pl-3">
                  <h3 className="font-bold">💻 Laser Focused Community Leadership</h3>
                  <p className="text-sm">Founded in 2022 by web3 enthusiasts, Flunks has weathered the storm and is now run by a devoted team with a specific vision for the brand.</p>
                  <span className="text-xs text-gray-600">Posted: August 15, 1998</span>
                </div>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-100 border-2 border-yellow-400 p-3 text-center">
                <h3 className="font-bold text-lg">📞 Contact Info</h3>
                <p className="text-sm mt-2">
                  <strong>Phone:</strong> (555) FHS-MAIN<br/>
                  <strong>Fax:</strong> (555) FHS-FAX<br/>
                  <strong>Address:</strong><br/>
                  [SCHOOL ADDRESS PLACEHOLDER]<br/>
                  Flunks City, FC 12345
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
                  <strong>Students:</strong> 1,200<br/>
                  <strong>Teachers:</strong> 85<br/>
                  <strong>Established:</strong> 1985<br/>
                  <strong>Graduation Rate:</strong> 96%
                </p>
              </div>
            </div>

            {/* School Community Characters */}
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="text-xl font-bold mb-3">🎓 Our School Community</h2>
              <p className="text-sm mb-3 text-gray-700">
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
              <p>👁️ You are visitor number: 001,337 | Last updated: September 15, 1999</p>
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
        position: 'relative'
      }}
    >
      <Toolbar className="flex gap-4 p-4 justify-center">
        <Button 
          onClick={() => setActiveTab('home')}
          style={{ 
            backgroundColor: activeTab === 'home' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'home' ? 'bold' : undefined,
            padding: '12px 20px',
            fontSize: '16px',
            minWidth: '140px',
            height: '48px'
          }}
        >
          🏠 Home
        </Button>
        <Button 
          onClick={() => setActiveTab('calendar')}
          style={{ 
            backgroundColor: activeTab === 'calendar' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'calendar' ? 'bold' : undefined,
            padding: '12px 20px',
            fontSize: '16px',
            minWidth: '180px',
            height: '48px'
          }}
        >
          📅 School Calendar
        </Button>
        <Button 
          onClick={() => setActiveTab('staff')}
          style={{ 
            backgroundColor: activeTab === 'staff' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'staff' ? 'bold' : undefined,
            padding: '12px 20px',
            fontSize: '16px',
            minWidth: '140px',
            height: '48px'
          }}
        >
          👨‍🏫 Staff
        </Button>
        <Button 
          onClick={() => setActiveTab('resources')}
          style={{ 
            backgroundColor: activeTab === 'resources' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'resources' ? 'bold' : undefined,
            padding: '12px 20px',
            fontSize: '16px',
            minWidth: '160px',
            height: '48px'
          }}
        >
          📚 Resources
        </Button>
        <Button 
          onClick={() => setActiveTab('map')}
          style={{ 
            backgroundColor: activeTab === 'map' ? '#c0c0c0' : undefined,
            fontWeight: activeTab === 'map' ? 'bold' : undefined,
            padding: '12px 20px',
            fontSize: '16px',
            minWidth: '160px',
            height: '48px'
          }}
        >
          🗺️ School Map
        </Button>
      </Toolbar>
      <WindowContent style={{ height: '100%', overflowY: 'auto' }}>
        {renderContent()}
      </WindowContent>
    </div>
  );
};

export default FHSSchool;
