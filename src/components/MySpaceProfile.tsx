import React from 'react';
import styled from 'styled-components';
import { CLIQUE_PROFILES, BACKGROUND_PATTERNS, CliqueProfile, Friend } from '../data/cliqueProfiles';
import MusicPlayer from './MusicPlayer';

interface MySpaceProfileProps {
  clique: string;
}

const ProfileContainer = styled.div<{ bgColor: string; pattern: string }>`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: ${props => props.bgColor};
  background-image: url("${props => BACKGROUND_PATTERNS[props.pattern as keyof typeof BACKGROUND_PATTERNS] || ''}");
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 11px;
  color: #ffffff;
  
  /* MySpace-style scrollbar */
  &::-webkit-scrollbar {
    width: 16px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e1e1e;
    border: 1px solid #666;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #666, #333);
    border: 1px solid #999;
  }
`;

const ProfileHeader = styled.div`
  background: linear-gradient(to bottom, #4a90e2, #357abd);
  color: white;
  padding: 10px;
  border-bottom: 2px solid #2c5aa0;
  font-family: 'Verdana', sans-serif;
  font-size: 12px;
  font-weight: bold;
`;

const ProfileContent = styled.div`
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 15px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Section = styled.div<{ bgColor?: string }>`
  background: ${props => props.bgColor || 'rgba(255, 255, 255, 0.9)'};
  border: 2px outset #cccccc;
  padding: 8px;
  color: #000000;
  font-family: 'Verdana', sans-serif;
  font-size: 11px;
`;

const SectionHeader = styled.div<{ bgColor?: string }>`
  background: ${props => props.bgColor || 'linear-gradient(to bottom, #4a90e2, #357abd)'};
  color: white;
  padding: 4px 8px;
  margin: -8px -8px 8px -8px;
  font-weight: bold;
  font-size: 11px;
  border-bottom: 1px solid #2c5aa0;
`;

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px inset #cccccc;
  padding: 10px;
  color: #000000;
`;

const UserName = styled.h1<{ color: string }>`
  color: ${props => props.color};
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 24px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  letter-spacing: 1px;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 5px;
  margin: 10px 0;
  font-size: 10px;
`;

const StatItem = styled.div`
  background: #f0f0f0;
  padding: 3px 5px;
  border: 1px solid #ccc;
`;

const AboutSection = styled.div`
  line-height: 1.4;
  margin: 10px 0;
`;

const FriendsList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const FriendCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  padding: 5px;
  text-align: center;
  font-size: 9px;
  color: #000;
`;

const FriendAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ccc, #999);
  margin: 0 auto 3px;
  border: 1px solid #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #333;
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
`;

const InterestTag = styled.span<{ bgColor: string }>`
  background: ${props => props.bgColor};
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 9px;
  border: 1px solid rgba(255,255,255,0.3);
`;

const ListItem = styled.li`
  margin: 2px 0;
  font-size: 10px;
  list-style-type: disc;
  margin-left: 15px;
`;

const BlinkingText = styled.span`
  animation: blink 1s infinite;
  color: #ff0000;
  font-weight: bold;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const MySpaceProfile: React.FC<MySpaceProfileProps> = ({ clique }) => {
  const profile = CLIQUE_PROFILES[clique];
  
  if (!profile) {
    return <div>Profile not found</div>;
  }

  const formatList = (items: string[], maxDisplay: number = 6) => {
    const displayItems = items.slice(0, maxDisplay);
    return displayItems.map((item, index) => (
      <ListItem key={index}>{item}</ListItem>
    ));
  };

  return (
    <ProfileContainer bgColor={profile.backgroundColor} pattern={profile.backgroundPattern}>
      <ProfileHeader>
        🏠 MyPlace.com - {profile.name}'s Profile
      </ProfileHeader>
      
      <ProfileContent>
        <MainContent>
          <UserInfo>
            <UserName color={profile.backgroundColor}>
              {profile.name}
            </UserName>
            
            <UserStats>
              <StatItem><strong>Mood:</strong> {profile.mood}</StatItem>
              <StatItem><strong>Location:</strong> {profile.location}</StatItem>
              <StatItem><strong>Age:</strong> {profile.age}</StatItem>
              <StatItem><strong>Last Login:</strong> {profile.lastLogin}</StatItem>
              <StatItem><strong>Profile Views:</strong> {profile.profileViews.toLocaleString()}</StatItem>
              <StatItem><strong>Status:</strong> <BlinkingText>Online</BlinkingText></StatItem>
            </UserStats>
          </UserInfo>

          <Section>
            <SectionHeader>About Me</SectionHeader>
            <AboutSection>
              {profile.aboutMe}
            </AboutSection>
            <div style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '10px', color: '#666' }}>
              <strong>Favorite Quote:</strong> "{profile.favoriteQuote}"
            </div>
          </Section>

          <Section>
            <SectionHeader>Interests</SectionHeader>
            <InterestsList>
              {profile.interests.map((interest, index) => (
                <InterestTag key={index} bgColor={profile.backgroundColor}>
                  {interest}
                </InterestTag>
              ))}
            </InterestsList>
          </Section>

          <Section>
            <SectionHeader>Music</SectionHeader>
            <ul style={{ margin: '5px 0', padding: 0 }}>
              {formatList(profile.music)}
            </ul>
          </Section>

          <Section>
            <SectionHeader>Movies</SectionHeader>
            <ul style={{ margin: '5px 0', padding: 0 }}>
              {formatList(profile.movies)}
            </ul>
          </Section>

          <Section>
            <SectionHeader>Books</SectionHeader>
            <ul style={{ margin: '5px 0', padding: 0 }}>
              {formatList(profile.books)}
            </ul>
          </Section>

          <Section>
            <SectionHeader>Heroes</SectionHeader>
            <ul style={{ margin: '5px 0', padding: 0 }}>
              {formatList(profile.heroes)}
            </ul>
          </Section>
        </MainContent>

        <Sidebar>
          <Section>
            <SectionHeader bgColor="#ff6600">Top 6 Friends</SectionHeader>
            <FriendsList>
              {profile.topFriends.map((friend: Friend, index: number) => (
                <FriendCard key={index}>
                  <FriendAvatar>
                    {friend.name.charAt(0)}
                  </FriendAvatar>
                  <div style={{ fontWeight: 'bold', fontSize: '8px' }}>
                    {friend.name}
                  </div>
                  <div style={{ fontSize: '7px', color: '#666', marginTop: '2px' }}>
                    {friend.status}
                  </div>
                </FriendCard>
              ))}
            </FriendsList>
          </Section>

          <Section bgColor="rgba(144, 238, 144, 0.9)">
            <SectionHeader bgColor="#228B22">Things I Like 👍</SectionHeader>
            <ul style={{ margin: '5px 0', padding: 0 }}>
              {profile.likes.slice(0, 8).map((like, index) => (
                <ListItem key={index}>{like}</ListItem>
              ))}
            </ul>
          </Section>

          <Section bgColor="rgba(255, 182, 193, 0.9)">
            <SectionHeader bgColor="#DC143C">Things I Dislike 👎</SectionHeader>
            <ul style={{ margin: '5px 0', padding: 0 }}>
              {profile.dislikes.slice(0, 8).map((dislike, index) => (
                <ListItem key={index}>{dislike}</ListItem>
              ))}
            </ul>
          </Section>

          <Section bgColor="rgba(255, 255, 0, 0.9)">
            <SectionHeader bgColor="#FF8C00">MyPlace Stats</SectionHeader>
            <div style={{ fontSize: '10px', color: '#000' }}>
              <div>📅 Member since: 1997</div>
              <div>👥 Friends: {profile.topFriends.length * 47}</div>
              <div>📧 Messages: {Math.floor(profile.profileViews / 10)}</div>
              <div>💬 Comments: {Math.floor(profile.profileViews / 5)}</div>
            </div>
          </Section>

          <Section>
            <SectionHeader bgColor="#8A2BE2">🎵 Profile Song</SectionHeader>
            <MusicPlayer
              songTitle={profile.profileSong?.split(' - ')[1] || profile.profileSong || "No song"}
              artist={profile.profileSong?.split(' - ')[0] || "Unknown Artist"}
              songFile={`/music/${profile.clique}.mp3`}
              themeColor={profile.backgroundColor}
            />
          </Section>

          <Section bgColor="rgba(221, 160, 221, 0.9)">
            <SectionHeader bgColor="#8A2BE2">Contact Info</SectionHeader>
            <div style={{ fontSize: '9px', color: '#000' }}>
              <div>📧 Email: {profile.name.toLowerCase()}@hotmail.com</div>
              <div>💬 AIM: {profile.name}AIM</div>
              <div>📱 Pager: 555-{Math.floor(Math.random() * 9000) + 1000}</div>
              <div>🌐 Website: www.geocities.com/~{profile.name.toLowerCase()}</div>
            </div>
          </Section>
        </Sidebar>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default MySpaceProfile;