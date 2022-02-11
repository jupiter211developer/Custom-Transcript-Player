import React from 'react';
import './App.css';

import Video from './components/video'

function App() {
  return (
    <div className="App">
      <Video
        videoSrc = '/static/sample.mp4'
        videoType = 'video/mp4'
        trackSrc = '/static/en.vtt'
        trackLabel = 'English'
        trackKind = 'subtitles'
        trackLang = 'en'
      />
    </div>
  );
}

export default App;