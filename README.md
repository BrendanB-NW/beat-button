# B. Boyd's Bangin' Beat Button

A modern, web-based Digital Audio Workstation (DAW) focused on educational melody creation with integrated music theory guidance. Built with React, TypeScript, and Web Audio API.

## ✨ Features

### 🎵 Core Audio Capabilities
- **Real-time audio synthesis** using Web Audio API and Tone.js
- **Multiple synthesis modes**: Pure waveforms (sine, square, sawtooth, triangle) and realistic instrument simulation (piano, guitar, strings)
- **Adjustable tempo** from 60-200 BPM with real-time changes
- **Multi-track support** for layered melodies and harmonies
- **Precision timing** down to 16th note subdivisions

### 🎓 Music Theory Integration
- **Modal theory assistance** with pop-up explanations and tooltips
- **Key/scale awareness** with project-specific key signatures
- **Chord progression suggestions** based on selected key and mood
- **Real-time melody analysis** with educational feedback
- **Non-intrusive learning** - suggestions only, never blocking creativity

### 🎹 Professional DAW Interface
- **Intuitive piano roll editor** with drag-and-drop note editing
- **Timeline view** for horizontal arrangement of musical phrases
- **Track management** with individual volume, pan, mute, and solo controls
- **Transport controls** with play, pause, stop, and tempo adjustment
- **Theory helper panel** with toggleable assistance sidebar

### 💾 Project Management
- **Local browser storage** for session persistence
- **Project import/export** in JSON format
- **Comprehensive undo/redo** system (50+ actions)
- **Auto-save functionality** to prevent data loss

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd beat-button
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

3. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 🎮 Usage Guide

### Creating Your First Project

1. **New Project**: Click the "+" button in the toolbar
2. **Configure**: Set project name, key signature (C Major recommended for beginners), and tempo
3. **Add Tracks**: Use the "Add Track" button in the left sidebar
4. **Choose Instruments**: Select from synthesizer types or realistic instruments

### Composing Music

1. **Piano Roll**: Click in the main grid to place notes
   - Vertical axis = pitch (higher = higher notes)
   - Horizontal axis = time (left to right)
   - Notes snap to grid for easy timing

2. **Theory Helper**: Toggle the "?" button to show:
   - **Chords tab**: Common chords in your key
   - **Scales tab**: Notes that work well together
   - **Tips tab**: Music theory guidance for beginners

3. **Playback**: Use transport controls to play, pause, or stop your composition

### Track Controls
- **Volume**: Adjust individual track levels
- **Pan**: Position tracks in stereo field (left/right)
- **Mute**: Temporarily silence tracks
- **Solo**: Listen to one track only

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: React 18+ with TypeScript
- **Audio**: Web Audio API with Tone.js
- **State Management**: Zustand
- **UI Components**: Headless UI with Tailwind CSS
- **Build System**: Vite
- **Testing**: Jest + React Testing Library + Playwright

### Project Structure
```
src/main/typescript/
├── components/
│   ├── daw/                 # Main DAW interface components
│   ├── common/              # Shared UI components
│   └── theory/              # Music theory helper components
├── services/
│   ├── audioEngine.ts       # Web Audio API integration
│   ├── musicTheory.ts       # Music theory calculations
│   └── projectManager.ts   # Project save/load logic
├── stores/
│   └── dawStore.ts          # Zustand state management
├── types/                   # TypeScript type definitions
└── hooks/                   # Custom React hooks
```

## 🧪 Testing

### Run Test Suite
```bash
npm run test                # Single run
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

## 📱 Browser Compatibility

### Fully Supported
- Chrome 66+
- Firefox 60+
- Safari 14.1+
- Edge 79+

## 🐛 Troubleshooting

### Common Issues

**Audio not playing**
- Check browser audio permissions
- Ensure headphones/speakers are connected
- Try refreshing the page to restart audio context

**Performance issues**
- Close other audio applications
- Reduce number of simultaneous tracks
- Check browser's task manager for memory usage

**Project not saving**
- Ensure browser allows local storage
- Check available storage space
- Try clearing browser cache if issues persist

## 📚 Educational Philosophy

B. Boyd's Bangin' Beat Button is designed with music education in mind:

- **Progressive Learning**: Start simple, add complexity gradually
- **Theory Integration**: Learn theory through practical application
- **Non-Judgmental**: No "wrong" notes, only learning opportunities
- **Immediate Feedback**: Hear your ideas instantly
- **Exploration Encouraged**: Experiment with different sounds and styles

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ for music education and creative expression.

**Start creating music today - no experience required!** 🎵