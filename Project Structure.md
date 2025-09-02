# B. Boyd's Bangin' Beat Button - Project Structure

```
b-boyds-bangin-beat-button/
├── CLAUDE.md                          # Complete project specification for AI regeneration
├── DECISIONS.md                       # Architectural decisions log
├── README.md                          # End-user documentation
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Build configuration
├── jest.config.js                     # Test configuration
├── .eslintrc.js                       # Code quality rules
├── .prettierrc                        # Code formatting
├── gradle/                            # Gradle wrapper (for Java preferences)
│   └── wrapper/
├── gradlew                            # Gradle wrapper script
├── gradlew.bat                        # Gradle wrapper (Windows)
├── build.gradle.kts                   # Gradle build configuration
├── src/
│   ├── main/
│   │   ├── typescript/                # Main application code
│   │   │   ├── components/            # React components
│   │   │   │   ├── common/            # Reusable UI components
│   │   │   │   ├── daw/               # DAW-specific components
│   │   │   │   ├── theory/            # Music theory components
│   │   │   │   └── synthesis/         # Audio synthesis components
│   │   │   ├── services/              # Business logic services
│   │   │   │   ├── audio/             # Audio engine services
│   │   │   │   ├── theory/            # Music theory services
│   │   │   │   ├── storage/           # Project save/load
│   │   │   │   └── export/            # Audio export services
│   │   │   ├── types/                 # TypeScript type definitions
│   │   │   ├── utils/                 # Utility functions
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── store/                 # State management
│   │   │   └── App.tsx                # Main application component
│   │   ├── resources/                 # Static resources
│   │   │   ├── styles/                # CSS/SCSS files
│   │   │   ├── assets/                # Images, icons
│   │   │   └── presets/               # Instrument presets
│   │   └── webapp/                    # Web application files
│   │       ├── index.html             # Main HTML template
│   │       └── manifest.json          # PWA manifest
│   └── test/
│       ├── unit/                      # Unit tests
│       ├── integration/               # Integration tests
│       ├── e2e/                       # End-to-end tests
│       └── fixtures/                  # Test data and fixtures
├── docs/                              # Additional documentation
│   ├── api/                           # API documentation
│   ├── architecture/                  # Architecture diagrams
│   └── user-guide/                    # Detailed user guides
└── scripts/                           # Build and deployment scripts
    ├── build.sh                       # Build script
    ├── test.sh                        # Test runner script
    └── deploy.sh                      # Deployment script
```

## Key Design Decisions

1. **Hybrid Gradle + Node.js Build**: Respecting Java/Gradle preference while using optimal web technologies
2. **TypeScript + React**: Type safety and component-based UI for complex DAW interface
3. **Web Audio API**: Real-time synthesis with maximum flexibility
4. **Modular Architecture**: Separate services for audio, theory, storage, and export
5. **Test-Driven Development**: Comprehensive testing at all levels
6. **Progressive Web App**: Installable application with offline capabilities