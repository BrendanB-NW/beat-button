// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/main/typescript/**/*.{ts,tsx}',
    '!src/main/typescript/**/*.d.ts',
    '!src/main/typescript/main.tsx',
    '!src/main/typescript/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '<rootDir>/src/test/unit/**/*.test.{ts,tsx}',
    '<rootDir>/src/test/integration/**/*.test.{ts,tsx}',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/main/typescript/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
  },
  testTimeout: 10000,
};

// src/test/setup.ts
import '@testing-library/jest-dom';

// Mock Web Audio API for testing
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn(() => ({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 440 },
      type: 'sine',
    })),
    createGain: jest.fn(() => ({
      connect: jest.fn(),
      gain: { value: 1 },
    })),
    destination: {},
    currentTime: 0,
    sampleRate: 44100,
  })),
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
  },
});

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});

// src/test/unit/example.test.ts - Example unit test
import { MusicTheoryService } from '@/services/theory/MusicTheoryService';
import { Key, ScaleType } from '@/types/music';

describe('MusicTheoryService', () => {
  let theoryService: MusicTheoryService;

  beforeEach(() => {
    theoryService = new MusicTheoryService();
  });

  describe('getScaleNotes', () => {
    it('should return correct notes for C major scale', () => {
      const key: Key = { tonic: 'C', mode: 'major' };
      const notes = theoryService.getScaleNotes(key, ScaleType.MAJOR);
      
      expect(notes).toHaveLength(7);
      expect(notes.map(note => note.name)).toEqual([
        'C', 'D', 'E', 'F', 'G', 'A', 'B'
      ]);
    });

    it('should return correct notes for A minor scale', () => {
      const key: Key = { tonic: 'A', mode: 'minor' };
      const notes = theoryService.getScaleNotes(key, ScaleType.NATURAL_MINOR);
      
      expect(notes).toHaveLength(7);
      expect(notes.map(note => note.name)).toEqual([
        'A', 'B', 'C', 'D', 'E', 'F', 'G'
      ]);
    });
  });

  describe('analyzeChordProgression', () => {
    it('should identify common progressions', () => {
      const progression = theoryService.analyzeChordProgression([
        { root: 'C', quality: 'major' },
        { root: 'A', quality: 'minor' },
        { root: 'F', quality: 'major' },
        { root: 'G', quality: 'major' },
      ]);

      expect(progression.romanNumerals).toEqual(['I', 'vi', 'IV', 'V']);
      expect(progression.commonName).toBe('vi-IV-I-V (Pop Progression)');
    });
  });
});

// src/test/integration/audio-theory.test.ts - Example integration test
import { AudioEngine } from '@/services/audio/AudioEngine';
import { MusicTheoryService } from '@/services/theory/MusicTheoryService';
import { ProjectManager } from '@/services/storage/ProjectManager';
import { Note, Key } from '@/types/music';

describe('Audio-Theory Integration', () => {
  let audioEngine: AudioEngine;
  let theoryService: MusicTheoryService;
  let projectManager: ProjectManager;

  beforeEach(async () => {
    audioEngine = new AudioEngine();
    theoryService = new MusicTheoryService();
    projectManager = new ProjectManager();
    await audioEngine.initialize();
  });

  afterEach(async () => {
    await audioEngine.cleanup();
  });

  it('should create theoretically sound chord progressions', async () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const suggestions = theoryService.suggestNextChord([], key);
    
    expect(suggestions).toHaveLength(3); // Typically I, IV, V
    
    // Play the suggested chords
    for (const suggestion of suggestions) {
      const notes = theoryService.getChordNotes(suggestion.chord);
      await audioEngine.playChord(notes, 1.0);
    }

    // Verify audio context is active
    expect(audioEngine.isInitialized()).toBe(true);
  });

  it('should save and load projects with theory metadata', async () => {
    const project = {
      id: 'test-project',
      name: 'Test Composition',
      key: { tonic: 'G', mode: 'major' } as Key,
      tempo: 120,
      tracks: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    await projectManager.saveProject(project);
    const loadedProject = await projectManager.loadProject('test-project');

    expect(loadedProject.key).toEqual(project.key);
    expect(loadedProject.tempo).toBe(120);
  });
});

// src/test/e2e/composition-workflow.spec.ts - Example E2E test
import { test, expect } from '@playwright/test';

test.describe('Composition Workflow', () => {
  test('user can create a basic melody', async ({ page }) => {
    await page.goto('/');

    // Create new project
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'My First Song');
    await page.click('[data-testid="confirm-button"]');

    // Set tempo
    await page.fill('[data-testid="tempo-input"]', '140');
    await expect(page.locator('[data-testid="tempo-display"]')).toHaveText('140 BPM');

    // Add notes to piano roll
    await page.click('[data-testid="piano-roll"] [data-note="C4"][data-beat="1"]');
    await page.click('[data-testid="piano-roll"] [data-note="E4"][data-beat="2"]');
    await page.click('[data-testid="piano-roll"] [data-note="G4"][data-beat="3"]');

    // Verify notes were added
    await expect(page.locator('[data-testid="note-C4-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="note-E4-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="note-G4-3"]')).toBeVisible();

    // Play the composition
    await page.click('[data-testid="play-button"]');
    await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute('data-playing', 'true');

    // Stop playback
    await page.click('[data-testid="stop-button"]');
    await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute('data-playing', 'false');
  });

  test('user can get music theory suggestions', async ({ page }) => {
    await page.goto('/');
    
    // Create project and add some notes
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Theory Test');
    await page.click('[data-testid="confirm-button"]');

    // Add a C major chord
    await page.click('[data-testid="piano-roll"] [data-note="C4"][data-beat="1"]');
    await page.click('[data-testid="piano-roll"] [data-note="E4"][data-beat="1"]');
    await page.click('[data-testid="piano-roll"] [data-note="G4"][data-beat="1"]');

    // Request theory help
    await page.click('[data-testid="theory-help-button"]');

    // Verify theory suggestions appear
    await expect(page.locator('[data-testid="theory-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="chord-analysis"]')).toContainText('C Major (I)');
    await expect(page.locator('[data-testid="next-chord-suggestions"]')).toBeVisible();

    // Click on a suggestion
    await page.click('[data-testid="chord-suggestion-F"]');
    
    // Verify suggestion was applied
    await expect(page.locator('[data-note="F4"][data-beat="2"]')).toHaveClass(/note-active/);
  });

  test('user can export audio', async ({ page }) => {
    await page.goto('/');
    
    // Create simple project
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Export Test');
    await page.click('[data-testid="confirm-button"]');
    
    // Add some notes
    await page.click('[data-testid="piano-roll"] [data-note="C4"][data-beat="1"]');
    await page.click('[data-testid="piano-roll"] [data-note="D4"][data-beat="2"]');

    // Open export dialog
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="export-dialog"]')).toBeVisible();

    // Configure export settings
    await page.selectOption('[data-testid="export-format"]', 'wav');
    await page.selectOption('[data-testid="export-quality"]', 'high');

    // Start export
    const downloadPromise = page.waitForDownload();
    await page.click('[data-testid="export-confirm"]');
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toBe('Export Test.wav');
  });
});

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/main/typescript/*"],
      "@test/*": ["src/test/*"]
    }
  },
  "include": [
    "src/**/*.ts", 
    "src/**/*.tsx"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}

// package.json
{
  "name": "b-boyds-bangin-beat-button",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tone": "^14.7.77",
    "zustand": "^4.4.1",
    "immer": "^10.0.2",
    "@headlessui/react": "^1.7.17",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5",
    "typescript": "^5.0.2",
    "jest": "^29.6.2",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.4",
    "jest-environment-jsdom": "^29.6.2",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.2",
    "@testing-library/user-event": "^14.4.3",
    "@playwright/test": "^1.37.1",
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27"
  }
}