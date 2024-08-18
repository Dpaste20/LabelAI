import React from 'react';
import HomeUI from './components/HomeUI';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <HomeUI />
    </ThemeProvider>
  );
}

export default App;