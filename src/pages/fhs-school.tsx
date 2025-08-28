import Head from 'next/head';
import { Button, Toolbar, Window, WindowContent, WindowHeader, Separator } from 'react95';
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const FHSSchoolPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">📅 School Calendar</h2>
            <div className="bg-white border-2 border-gray-400 p-3">
              <h3 className="font-bold text-lg mb-2">Upcoming Events:</h3>
              <ul className="space-y-2">
                <li>• <strong>Sept 15:</strong> Homecoming Dance</li>
                <li>• <strong>Sept 20:</strong> Football vs. Riverside High</li>
                <li>• <strong>Oct 1:</strong> Parent-Teacher Conferences</li>
                <li>• <strong>Oct 15:</strong> Fall Break Begins</li>
                <li>• <strong>Nov 5:</strong> Academic Awards Ceremony</li>
                <li>• <strong>Dec 20:</strong> Winter Break Begins</li>
              </ul>
            </div>
            <div className="bg-yellow-100 border-2 border-yellow-400 p-3">
              <h3 className="font-bold">🏈 Sports Schedule:</h3>
              <p>Check the gymnasium bulletin board for updated game times!</p>
            </div>
          </div>
        );
      
      case 'staff':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">👨‍🏫 Faculty & Staff</h2>
            
            <div className="bg-white border-2 border-gray-400 p-3">
              <h3 className="font-bold text-lg mb-3">Administration:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-gray-300 p-2">
                  <strong>Principal:</strong> Dr. [PLACEHOLDER NAME]<br/>
                  <em>Office: Room 101</em><br/>
                  <em>Ext: 1001</em>
                </div>
                <div className="border border-gray-300 p-2">
                  <strong>Vice Principal:</strong> Mrs. [PLACEHOLDER NAME]<br/>
                  <em>Office: Room 102</em><br/>
                  <em>Ext: 1002</em>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-400 p-3">
              <h3 className="font-bold text-lg mb-3">Department Heads:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>• <strong>Mathematics:</strong> Mr. [PLACEHOLDER]</div>
                <div>• <strong>English:</strong> Ms. [PLACEHOLDER]</div>
                <div>• <strong>Science:</strong> Dr. [PLACEHOLDER]</div>
                <div>• <strong>History:</strong> Mrs. [PLACEHOLDER]</div>
                <div>• <strong>Physical Education:</strong> Coach [PLACEHOLDER]</div>
                <div>• <strong>Arts:</strong> Ms. [PLACEHOLDER]</div>
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
                  <strong>🏃‍♂️ Sports Teams:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• Football (Fall)</li>
                    <li>• Basketball (Winter)</li>
                    <li>• Baseball/Softball (Spring)</li>
                    <li>• Track & Field</li>
                    <li>• Volleyball</li>
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
      
      default: // home
        return (
          <div className="p-4 space-y-4">
            {/* Hero Section with Background Placeholder */}
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 border-4 border-gray-400 text-center"
              style={{
                backgroundImage: 'url([BACKGROUND_PLACEHOLDER])',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay'
              }}
            >
              <h1 className="text-3xl font-bold mb-2">🏫 FLUNKS HIGH SCHOOL</h1>
              <p className="text-xl">Home of the Astros 🚀</p>
              <p className="text-lg mt-2">Excellence in Education Since 1985</p>
            </div>

            {/* News & Announcements */}
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="text-xl font-bold mb-3 text-red-600">📢 Latest News & Announcements</h2>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-bold">🎉 Welcome Back Students!</h3>
                  <p className="text-sm">The new school year is off to a great start! Don't forget to pick up your student handbooks from the main office.</p>
                  <span className="text-xs text-gray-600">Posted: September 1, 1999</span>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-green-500 pl-3">
                  <h3 className="font-bold">🏆 Football Team Wins Big!</h3>
                  <p className="text-sm">Congratulations to our varsity football team for their 28-14 victory over Central High last Friday night!</p>
                  <span className="text-xs text-gray-600">Posted: September 10, 1999</span>
                </div>
                
                <Separator />
                
                <div className="border-l-4 border-purple-500 pl-3">
                  <h3 className="font-bold">📚 New Computer Lab Opens</h3>
                  <p className="text-sm">Check out our brand new computer lab featuring 20 state-of-the-art Pentium computers with internet access!</p>
                  <span className="text-xs text-gray-600">Posted: August 25, 1999</span>
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
                  <strong>Students:</strong> 1,738<br/>
                  <strong>Teachers:</strong> not enough<br/>
                  <strong>Established:</strong> 1986<br/>
                  <strong>Graduation Rate:</strong> 69%
                </p>
              </div>
            </div>

            {/* Principal's Message */}
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="text-xl font-bold mb-3">💼 Message from Principal [PRINCIPAL_NAME_PLACEHOLDER]</h2>
              <div className="flex gap-4">
                <div className="bg-gray-200 border border-gray-400 w-24 h-24 flex items-center justify-center text-xs text-center">
                  [PRINCIPAL<br/>PHOTO<br/>PLACEHOLDER]
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    "Welcome to Flunks High School! We are committed to providing our students with the best education possible 
                    in a safe and nurturing environment. Our dedicated faculty and staff work tirelessly to help each student 
                    reach their full potential. We encourage all students to get involved in our many extracurricular activities 
                    and take advantage of the opportunities available here at FHS."
                  </p>
                  <p className="text-right text-sm mt-2 italic">- Principal [PRINCIPAL_NAME_PLACEHOLDER]</p>
                </div>
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
    <>
      <Head>
        <title>Flunks High School - Home of the Astros</title>
      </Head>
      <div 
        className="flex flex-col items-center min-h-screen py-8 gap-4"
        style={{
          background: 'linear-gradient(45deg, #008080, #006666)',
          backgroundImage: 'url([BACKGROUND_TEXTURE_PLACEHOLDER])'
        }}
      >
        <Window className="w-full max-w-5xl">
          <WindowHeader className="flex justify-between items-center">
            <span>🏫 Flunks High School - Official Website</span>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  padding: '0',
                  fontSize: '12px',
                  minWidth: '20px'
                }}
                onClick={() => router.push('/')}
                title="Minimize"
              >
                _
              </Button>
              <Button 
                size="sm" 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  padding: '0',
                  fontSize: '12px',
                  minWidth: '20px'
                }}
                onClick={() => router.push('/')}
                title="Close"
              >
                ×
              </Button>
            </div>
          </WindowHeader>
          <Toolbar className="flex gap-2 p-2">
            <Button 
              onClick={() => setActiveTab('home')}
              style={{ 
                backgroundColor: activeTab === 'home' ? '#c0c0c0' : undefined,
                fontWeight: activeTab === 'home' ? 'bold' : undefined
              }}
            >
              🏠 Home
            </Button>
            <Button 
              onClick={() => setActiveTab('calendar')}
              style={{ 
                backgroundColor: activeTab === 'calendar' ? '#c0c0c0' : undefined,
                fontWeight: activeTab === 'calendar' ? 'bold' : undefined
              }}
            >
              📅 School Calendar
            </Button>
            <Button 
              onClick={() => setActiveTab('staff')}
              style={{ 
                backgroundColor: activeTab === 'staff' ? '#c0c0c0' : undefined,
                fontWeight: activeTab === 'staff' ? 'bold' : undefined
              }}
            >
              👨‍🏫 Staff
            </Button>
            <Button 
              onClick={() => setActiveTab('resources')}
              style={{ 
                backgroundColor: activeTab === 'resources' ? '#c0c0c0' : undefined,
                fontWeight: activeTab === 'resources' ? 'bold' : undefined
              }}
            >
              📚 Resources
            </Button>
          </Toolbar>
          <WindowContent style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {renderContent()}
          </WindowContent>
        </Window>
      </div>
    </>
  );
};

export default FHSSchoolPage;
