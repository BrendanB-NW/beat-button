import React from 'react';
import { DAWInterface } from '@/components/daw/DAWInterface';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { TheoryHelper } from '@/components/theory/TheoryHelper';
import { useDAWStore } from '@/stores/dawStore';
import './App.css';

function App() {
  const theoryHelperVisible = useDAWStore((state) => state.theoryHelperVisible);

  return (
    <ErrorBoundary>
      <div className="h-screen bg-earth-bg-900 text-earth-bg-50 flex flex-col overflow-hidden">
        <header className="bg-earth-bg-800 border-b border-earth-bg-700 p-4">
          <h1 className="text-2xl font-bold text-primary-500">
            B. Boyd's Bangin' Beat Button
          </h1>
        </header>
        
        <main className="flex-1 flex min-h-0">
          <DAWInterface />
          {theoryHelperVisible && <TheoryHelper />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;