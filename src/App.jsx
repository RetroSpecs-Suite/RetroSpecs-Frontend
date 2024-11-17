import Login from './pages/login/Login'
import Query from './pages/query/Query'
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from './tools/firebase'

const App = () => {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true);
      } else {
        setAuthed(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-thing">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <>
      {!authed ? (
        <Login setAuthed={setAuthed} />
      ) : (
        <Query setAuthed={setAuthed} />
      )}
    </>
  );
};

export default App;
