import { signInWithPopup , GoogleAuthProvider } from "firebase/auth";
import './login.css';
import {auth} from '../../tools/firebase'

const Login = ({setAuthed}) => {

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider)
      setAuthed(true)
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };
  
  return (
    <div className="split-container">
      <div className="left-side">
        <div className="main-title">
          <img src="/logo.png" alt="RetroSpecs Logo" />
          <p>RetroSpecs</p>
        </div>
        <h1>Your Memories, Frame by Frame</h1>
        <p>AI that helps you remember your day, capture moments, and reflect on what matters.</p>
        <div className="login-content">
          <button className="google-sign-in" onClick={handleGoogleSignIn} aria-label="Sign in with Google">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" alt="google logo" />
            <span>Sign in with Google</span>
        </button>
        </div>
      </div>
      <div className="right-content">
        <img src = "Ray-Ban-Stories-Under-the-Hood_Header.gif" alt = 'Image of glasses'></img>
      </div>
    </div>
  );
};

export default Login;