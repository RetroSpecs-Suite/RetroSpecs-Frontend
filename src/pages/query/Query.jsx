import { useState, useRef, useEffect } from 'react';
import { Search, GalleryVerticalEnd, LogOut } from 'lucide-react';
import { auth } from '../../tools/firebase';
import './query.css'

const Query = ({ setAuthed }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const searchRef = useRef(null);
  const resultsEndRef = useRef(null);
  const searchPageRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const placeholders = [
    "What's on your mind?",
    "What do you want to know?",
    "Hey, what's up?",
    "Need me to remind you about anything?",
    "Any thoughts about your day?",
    "Let's chat about your experiences...",
    "Want to reflect on something?",
    "What would you like to remember?",
    "Looking for a specific memory?",
  ];

  // Get random placeholder text
  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholders.length);
    return placeholders[randomIndex];
  };

  // Effect to handle typing animation for placeholder
  useEffect(() => {
    let currentText = getRandomPlaceholder();
    let currentChar = 0;
    let typingInterval;

    const typeText = () => {
      if (currentChar <= currentText.length) {
        setCurrentPlaceholder(currentText.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          let deletingInterval = setInterval(() => {
            if (currentChar > 0) {
              currentChar--;
              setCurrentPlaceholder(currentText.slice(0, currentChar));
            } else {
              clearInterval(deletingInterval);
              currentText = getRandomPlaceholder();
            }
          }, 50);
        }, 15000);
      }
    };

    typingInterval = setInterval(typeText, 125);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  // Effect to handle scrolling after results update
  useEffect(() => {
    if (results?.length && resultsEndRef.current) {
      setIsRendering(true);
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Wait for two animation frames to ensure DOM has fully painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const startY = searchPageRef.current?.offsetTop || 0;
          const endY = resultsEndRef.current?.offsetTop || 0;
          const distance = endY - startY;
          
          let start = null;
          const duration = 750;

          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function
            const easeInOutCubic = t => t < 0.5
              ? 4 * t * t * t
              : 1 - Math.pow(-2 * t + 2, 3) / 2;
            
            const currentPosition = startY + (distance * easeInOutCubic(percentage));
            window.scrollTo({
              top: currentPosition,
              behavior: 'auto'
            });

            if (progress < duration) {
              window.requestAnimationFrame(step);
            } else {
              setIsRendering(false);
            }
          };

          window.requestAnimationFrame(step);
        });
      });
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [results]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setAuthed(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setLoading(true);
    
    try {
      const response = await fetch('http://192.168.1.135:4000/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          uid: auth.currentUser.uid
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();

      console.log('Search results:', data);

      function decodeBase64Image(base64String) {
        // Check if the base64 string is valid
        if (!base64String || typeof base64String !== 'string') {
          return null;
        }

        try {
          // Remove data URL prefix if it exists
          const base64Data = base64String.includes('data:image')
            ? base64String
            : `data:image/jpeg;base64,${base64String}`;

          // Create a Blob from the base64 string
          const byteCharacters = atob(base64Data.split(',')[1]);
          const byteArrays = [];

          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }

          const byteArray = new Uint8Array(byteArrays);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });

          // Create and return an object URL
          return URL.createObjectURL(blob);
        } catch (error) {
          console.error('Error decoding base64 image:', error);
          return null;
        }
      }
      
      const formattedResults = {
        title: query,
        id: data.timestamp,
        content: data.content,
        imageUrl: data.image ? decodeBase64Image(data.image) : null
      };
  
      setResults(prevResults => [
        ...(prevResults || []),
        formattedResults
      ]);
    } catch (error) {
      console.error('Search failed:', error);
      // setError('Failed to fetch search results. Please try again.');

    } finally {
      setLoading(false);
      setQuery('');
    }
};

  return (
    <div className="container">
      <div className="results" style={{ 
        opacity: isRendering ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out'
      }}>
        {results && !loading && (
          <>
            {results.map((result, index) => (
              <div 
                className="result" 
                key={result.id} 
                ref={index === results.length - 1 ? resultsEndRef : null}
                style={{
                  opacity: isRendering ? 0 : 1,
                  transform: isRendering ? 'translateY(20px)' : 'translateY(0)',
                  transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
                }}
              >
                <div className="query-header">
                  <div/>
                  {result.title}
                </div>
                <div className="result-card">
                  <img
                    className="result-image"
                    src={result.imageUrl}
                    alt={result.title}
                  />
                  <p>{result.content}</p>
                </div>
              </div>
            ))}
          </>
        )}
        {results && (
          <div 
            className="bouncer bouncing-element"
            style={{
              opacity: isRendering ? 0 : 1,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <GalleryVerticalEnd size={12} />
            <span>*Scroll for A New Search</span>
          </div>
        )}
      </div>
      <div className="content-wrapper" ref={searchPageRef}>
        <div className="logout-btn" onClick={handleSignOut}>
          <LogOut size={25}/>
        </div>
        <div className="content">
          <div className="title">
            <img src="/logo.png" alt="RetroSpecs Logo" />
            <h1>RetroSpecs</h1>
          </div>
          <p>Ask About Your Day!</p>
        </div>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentPlaceholder}
          />
          
          <button className="search-button">
            <Search size={24} />
          </button>
        </form>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Query;