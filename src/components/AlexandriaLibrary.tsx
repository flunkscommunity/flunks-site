import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import * as fcl from '@onflow/fcl';

// Alexandria contract address on mainnet
const ALEXANDRIA_ADDRESS = '0xfed1adffd14ea9d0';

// Animations
const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const glowPulse = keyframes`
  0%, 100% { text-shadow: 0 0 5px currentColor; }
  50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Container = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a0a2e 0%, #0d1b2a 50%, #1a0a2e 100%);
  color: #00ff88;
  font-family: 'VT323', 'Courier New', monospace;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 255, 136, 0.03) 0px,
      rgba(0, 255, 136, 0.03) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(
      transparent 0%,
      rgba(0, 255, 136, 0.02) 50%,
      transparent 100%
    );
    animation: ${scanline} 8s linear infinite;
    pointer-events: none;
    z-index: 2;
  }
`;

const Header = styled.div`
  padding: 20px;
  text-align: center;
  border-bottom: 2px solid #00ff88;
  background: rgba(0, 255, 136, 0.05);
  position: relative;
  z-index: 10;
`;

const Title = styled.h1`
  font-size: 32px;
  margin: 0 0 5px 0;
  color: #00ff88;
  animation: ${glowPulse} 2s ease-in-out infinite;
  letter-spacing: 4px;
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #88ffcc;
  margin: 0;
  opacity: 0.8;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div<{ collapsed?: boolean }>`
  width: ${props => props.collapsed ? '50px' : '280px'};
  background: rgba(0, 0, 0, 0.4);
  border-right: 2px solid #00ff88;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    height: ${props => props.collapsed ? '50px' : '200px'};
    border-right: none;
    border-bottom: 2px solid #00ff88;
  }
`;

const SidebarHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.span`
  font-size: 14px;
  color: #ffff00;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const CollapseButton = styled.button`
  background: none;
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 5px 10px;
  cursor: pointer;
  font-family: inherit;
  
  &:hover {
    background: rgba(0, 255, 136, 0.2);
  }
`;

const GenreList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00ff88;
    border-radius: 4px;
  }
`;

const GenreItem = styled.button<{ active?: boolean }>`
  width: 100%;
  padding: 10px 15px;
  margin-bottom: 5px;
  background: ${props => props.active ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.1)'};
  border: 1px solid ${props => props.active ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'};
  color: ${props => props.active ? '#ffff00' : '#00ff88'};
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: #00ff88;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SearchBar = styled.div`
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00ff88;
  color: #00ff88;
  font-family: inherit;
  font-size: 16px;
  
  &::placeholder {
    color: rgba(0, 255, 136, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
`;

const BookGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  align-content: start;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00ff88;
    border-radius: 4px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const BookCard = styled.button`
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 255, 136, 0.5);
  padding: 20px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;
  
  &:hover {
    border-color: #ffff00;
    background: rgba(0, 255, 136, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.3);
  }
`;

const BookTitle = styled.div`
  font-size: 16px;
  color: #00ff88;
  margin-bottom: 8px;
  line-height: 1.3;
`;

const BookMeta = styled.div`
  font-size: 12px;
  color: #88ffcc;
  opacity: 0.7;
`;

// Reader View
const ReaderContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ReaderHeader = styled.div`
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 2px solid #00ff88;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  background: rgba(255, 0, 136, 0.2);
  border: 2px solid #ff0088;
  color: #ff0088;
  padding: 8px 15px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  
  &:hover {
    background: rgba(255, 0, 136, 0.4);
  }
`;

const ReaderTitle = styled.h2`
  flex: 1;
  margin: 0;
  font-size: 18px;
  color: #ffff00;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChapterNav = styled.div`
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  gap: 10px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00ff88;
    border-radius: 3px;
  }
`;

const ChapterButton = styled.button<{ active?: boolean }>`
  padding: 8px 15px;
  background: ${props => props.active ? 'rgba(255, 255, 0, 0.3)' : 'rgba(0, 255, 136, 0.1)'};
  border: 1px solid ${props => props.active ? '#ffff00' : 'rgba(0, 255, 136, 0.5)'};
  color: ${props => props.active ? '#ffff00' : '#00ff88'};
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  white-space: nowrap;
  
  &:hover {
    background: rgba(0, 255, 136, 0.2);
  }
`;

const ReaderContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: rgba(0, 0, 0, 0.2);
  
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00ff88;
    border-radius: 5px;
  }
`;

const ChapterTitle = styled.h3`
  font-size: 24px;
  color: #ffff00;
  margin-bottom: 20px;
  text-align: center;
  animation: ${glowPulse} 3s ease-in-out infinite;
`;

const Paragraph = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: #ccffee;
  margin-bottom: 20px;
  text-align: justify;
  animation: ${fadeIn} 0.5s ease-out;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #00ff88;
  font-size: 18px;
  animation: ${glowPulse} 1s ease-in-out infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #88ffcc;
  
  h3 {
    font-size: 24px;
    color: #ffff00;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 14px;
    opacity: 0.7;
  }
`;

const PoweredBy = styled.div`
  padding: 10px;
  text-align: center;
  font-size: 11px;
  color: rgba(0, 255, 136, 0.5);
  border-top: 1px solid rgba(0, 255, 136, 0.2);
  
  a {
    color: #00ff88;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Types
interface Book {
  title: string;
  genre: string;
}

interface Chapter {
  title: string;
  paragraphs: string[] | null;
}

interface GenreWithCount {
  name: string;
  bookCount: number;
}

// Helper function to convert Roman numerals to numbers
const romanToNumber = (roman: string): number => {
  const romanMap: { [key: string]: number } = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
  };
  
  let result = 0;
  let prev = 0;
  
  for (let i = roman.length - 1; i >= 0; i--) {
    const current = romanMap[roman[i]] || 0;
    if (current < prev) {
      result -= current;
    } else {
      result += current;
    }
    prev = current;
  }
  
  return result;
};

// Helper function to extract and parse chapter number from title
const extractChapterNumber = (title: string): { number: number; original: string } | null => {
  // Try to match patterns like "Chapter 1", "Chapter 22", "Ch. 3", etc.
  const arabicMatch = title.match(/(?:chapter|ch\.?)\s*(\d+)/i);
  if (arabicMatch) {
    return { number: parseInt(arabicMatch[1], 10), original: title };
  }
  
  // Try to match Roman numerals like "Chapter I", "Chapter II", "Ch. III", etc.
  const romanMatch = title.match(/(?:chapter|ch\.?)\s*([IVXLCDM]+)/i);
  if (romanMatch) {
    const romanNum = romanMatch[1].toUpperCase();
    return { number: romanToNumber(romanNum), original: title };
  }
  
  // Try to match standalone numbers at the start or end
  const standaloneMatch = title.match(/^(\d+)|(\d+)$/);
  if (standaloneMatch) {
    return { number: parseInt(standaloneMatch[1] || standaloneMatch[2], 10), original: title };
  }
  
  // Try to match standalone Roman numerals
  const standaloneRomanMatch = title.match(/^([IVXLCDM]+)$/i);
  if (standaloneRomanMatch) {
    return { number: romanToNumber(standaloneRomanMatch[1].toUpperCase()), original: title };
  }
  
  return null;
};

// Helper function to sort chapters by their numbers
const sortChapters = (chapters: Chapter[]): Chapter[] => {
  return [...chapters].sort((a, b) => {
    const aNum = extractChapterNumber(a.title);
    const bNum = extractChapterNumber(b.title);
    
    // If both have numbers, sort numerically
    if (aNum && bNum) {
      return aNum.number - bNum.number;
    }
    
    // If only one has a number, prioritize it
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    
    // If neither has a number, sort alphabetically
    return a.title.localeCompare(b.title);
  });
};

// Cadence Scripts - matching exact format from Alexandria repo
const getGenresScript = `
import Alexandria from 0xfed1adffd14ea9d0

access(all) 
fun main(): [String]?  {
    return Alexandria.getAllGenres()
} 
`;

const getBooksByGenreScript = `
import Alexandria from 0xfed1adffd14ea9d0

access(all) 
fun main(genre: String): [String]?  {
    return Alexandria.getGenre(genre: genre)
} 
`;

const getChapterTitlesScript = `
import Alexandria from 0xfed1adffd14ea9d0   

access(all) 
fun main(bookTitle: String): [String]  {
    return Alexandria.getBookChapterTitles(bookTitle: bookTitle)
} 
`;

const getChapterParagraphScript = `
import Alexandria from 0xfed1adffd14ea9d0

access(all) 
fun main(bookTitle: String, chapterTitle: String, paragraphIndex: Int): String  {
    return Alexandria.getBookParagraph(bookTitle: bookTitle, chapterTitle: chapterTitle, paragraphIndex: paragraphIndex)
}   
`;

const getBookChaptersScript = `
import Alexandria from 0xfed1adffd14ea9d0   

access(all) 
fun main(bookTitle: String): &Alexandria.Book?  {
    return Alexandria.getBook(bookTitle: bookTitle)
} 
`;

// Main Component
const AlexandriaLibrary: React.FC = () => {
  const [genresWithCounts, setGenresWithCounts] = useState<GenreWithCount[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Reader state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number | null>(null);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Fetch all genres and their books on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log('📚 Alexandria: Fetching genres...');
        const genreResult = await fcl.query({
          cadence: getGenresScript,
          args: () => []
        });
        
        const genres: string[] = genreResult || [];
        console.log('📚 Alexandria: Found', genres.length, 'genres');
        
        // Fetch books for each genre in parallel
        const genreData: GenreWithCount[] = [];
        const allBooksData: Book[] = [];
        
        await Promise.all(genres.map(async (genreName) => {
          try {
            const booksResult = await fcl.query({
              cadence: getBooksByGenreScript,
              args: (arg: any, t: any) => [arg(genreName, t.String)]
            });
            
            const books: string[] = booksResult || [];
            genreData.push({ name: genreName, bookCount: books.length });
            
            // Add books to allBooks with genre
            books.forEach(title => {
              allBooksData.push({ title, genre: genreName });
            });
            
            if (books.length > 0) {
              console.log('📚 Alexandria:', genreName, '-', books.length, 'books');
            }
          } catch (error) {
            console.error('📚 Alexandria: Error fetching', genreName, error);
            genreData.push({ name: genreName, bookCount: 0 });
          }
        }));
        
        // Sort genres: ones with books first, then alphabetically
        genreData.sort((a, b) => {
          if (a.bookCount > 0 && b.bookCount === 0) return -1;
          if (a.bookCount === 0 && b.bookCount > 0) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setGenresWithCounts(genreData);
        setAllBooks(allBooksData);
        
        console.log('📚 Alexandria: Total books loaded:', allBooksData.length);
        
      } catch (error) {
        console.error('📚 Alexandria: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Get books to display based on selected genre and search
  const displayedBooks = allBooks.filter(book => {
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // Open book and fetch all chapters with content at once using original script
  const openBook = useCallback(async (book: Book) => {
    setSelectedBook(book);
    setChapters([]);
    setSelectedChapterIdx(null);
    setLoadingChapter(true);
    
    try {
      console.log('📚 Alexandria: Fetching all chapters with content for:', book.title);
      const result = await fcl.query({
        cadence: getBookChaptersScript,
        args: (arg: any, t: any) => [arg(book.title, t.String)]
      });
      
      console.log('📚 Alexandria: Book resource:', result);
      
      if (!result) {
        throw new Error('Book not found');
      }
      
      // Parse the Book resource - it has a Chapters field (matching Alexandria Library pattern)
      const chaptersData = result.Chapters || {};
      const entries = Object.values(chaptersData);
      
      const normalized = entries
        .map((c: any) => ({
          title: c.chapterTitle,
          paragraphs: c.paragraphs,
          index: typeof c.index === 'string' ? parseInt(c.index, 10) : c.index,
        }))
        .filter((c: any) => c.title && Array.isArray(c.paragraphs))
        .sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0))
        .map(({ title, paragraphs }: any) => ({ 
          title, 
          paragraphs: paragraphs.length > 0 ? paragraphs : null 
        }));
      
      // Apply chapter number sorting as a secondary sort (handles Roman numerals)
      const finalChapters = sortChapters(normalized);
      
      console.log('📚 Alexandria: Loaded', finalChapters.length, 'chapters');
      
      setChapters(finalChapters);
      if (finalChapters.length > 0) {
        setSelectedChapterIdx(0); // Always start with the first chapter after sorting
      }
    } catch (error) {
      console.error('📚 Alexandria: Error fetching chapters:', error);
      // Fallback to fetching just titles if batch fetch fails
      try {
        const result = await fcl.query({
          cadence: getChapterTitlesScript,
          args: (arg: any, t: any) => [arg(book.title, t.String)]
        });
        
        const chapterList = (result || []).map((title: string) => ({
          title,
          paragraphs: null
        }));
        
        const sortedChapters = sortChapters(chapterList);
        setChapters(sortedChapters);
        if (sortedChapters.length > 0) {
          setSelectedChapterIdx(0);
        }
      } catch (fallbackError) {
        console.error('📚 Alexandria: Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoadingChapter(false);
    }
  }, []);

  // Render Reader View
  if (selectedBook) {
    const currentChapter = selectedChapterIdx !== null ? chapters[selectedChapterIdx] : null;
    
    return (
      <Container>
        <ReaderContainer>
          <ReaderHeader>
            <BackButton onClick={() => setSelectedBook(null)}>
              ← BACK
            </BackButton>
            <ReaderTitle>{selectedBook.title}</ReaderTitle>
          </ReaderHeader>
          
          {chapters.length > 0 && (
            <ChapterNav>
              {chapters.map((chapter, idx) => (
                <ChapterButton
                  key={idx}
                  active={selectedChapterIdx === idx}
                  onClick={() => setSelectedChapterIdx(idx)}
                >
                  {chapter.title}
                </ChapterButton>
              ))}
            </ChapterNav>
          )}
          
          <ReaderContent>
            {loadingChapter ? (
              <LoadingText>Loading chapters...</LoadingText>
            ) : !currentChapter ? (
              <LoadingText>Loading chapters...</LoadingText>
            ) : currentChapter.paragraphs && currentChapter.paragraphs.length > 0 ? (
              <>
                <ChapterTitle>{currentChapter.title}</ChapterTitle>
                {currentChapter.paragraphs.map((para, idx) => (
                  <Paragraph key={idx}>{para}</Paragraph>
                ))}
              </>
            ) : (
              <EmptyState>
                <h3>No Content</h3>
                <p>This chapter appears to be empty.</p>
              </EmptyState>
            )}
          </ReaderContent>
          
          <PoweredBy>
            Powered by <a href="https://alexandrialib.online" target="_blank" rel="noopener noreferrer">Alexandria Library</a> on Flow Blockchain
          </PoweredBy>
        </ReaderContainer>
      </Container>
    );
  }

  // Render Library View
  return (
    <Container>
      <Header>
        <Title>📚 ALEXANDRIA LIBRARY</Title>
        <Subtitle>On-Chain Books • Preserved Forever on Flow Blockchain</Subtitle>
      </Header>
      
      <MainContent>
        <Sidebar collapsed={sidebarCollapsed}>
          <SidebarHeader>
            {!sidebarCollapsed && <SidebarTitle>GENRES</SidebarTitle>}
            <CollapseButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '→' : '←'}
            </CollapseButton>
          </SidebarHeader>
          
          {!sidebarCollapsed && (
            <GenreList>
              {loading ? (
                <LoadingText>Loading...</LoadingText>
              ) : (
                <>
                  <GenreItem
                    active={selectedGenre === 'all'}
                    onClick={() => setSelectedGenre('all')}
                  >
                    📖 All Books ({allBooks.length})
                  </GenreItem>
                  {genresWithCounts.map(genre => (
                    <GenreItem
                      key={genre.name}
                      active={selectedGenre === genre.name}
                      onClick={() => setSelectedGenre(genre.name)}
                      style={{ opacity: genre.bookCount === 0 ? 0.5 : 1 }}
                    >
                      {genre.name} {genre.bookCount > 0 && `(${genre.bookCount})`}
                    </GenreItem>
                  ))}
                </>
              )}
            </GenreList>
          )}
        </Sidebar>
        
        <ContentArea>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          
          <BookGrid>
            {loading ? (
              <LoadingText>Loading books from the blockchain...</LoadingText>
            ) : displayedBooks.length === 0 ? (
              <EmptyState>
                <h3>No Books Found</h3>
                <p>{searchQuery ? 'Try a different search term.' : 'This genre has no books yet.'}</p>
              </EmptyState>
            ) : (
              displayedBooks.map(book => (
                <BookCard key={`${book.genre}-${book.title}`} onClick={() => openBook(book)}>
                  <BookTitle>{book.title}</BookTitle>
                  <BookMeta>{book.genre}</BookMeta>
                </BookCard>
              ))
            )}
          </BookGrid>
        </ContentArea>
      </MainContent>
      
      <PoweredBy>
        Powered by <a href="https://alexandrialib.online" target="_blank" rel="noopener noreferrer">Alexandria Library</a> • Built by Noah | ArtDrop
      </PoweredBy>
    </Container>
  );
};

export default AlexandriaLibrary;
