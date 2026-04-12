import { Toaster } from "@/components/ui/toaster.jsx"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home';
import ModeSelect from '@/pages/ModeSelect';
import TeamSelect from '@/pages/TeamSelect';
import Match from '@/pages/Match';
import Results from '@/pages/Results';
import Story from '@/pages/Story';
import Achievements from '@/pages/Achievements';
import CharacterSelect from '@/pages/CharacterSelect';
import Profile from '@/pages/Profile';
import Training from '@/pages/Training';
import English from '@/pages/English';
import Saude from '@/pages/Saude';
import About from '@/pages/About';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mode-select" element={<ModeSelect />} />
      <Route path="/team-select" element={<TeamSelect />} />
      <Route path="/match" element={<Match />} />
      <Route path="/results" element={<Results />} />
      <Route path="/story" element={<Story />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/character-select" element={<CharacterSelect />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/training" element={<Training />} />
      <Route path="/english" element={<English />} />
      <Route path="/saude" element={<Saude />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App