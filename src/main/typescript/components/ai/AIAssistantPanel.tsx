import React, { useState, useRef, useEffect } from 'react';
import { useDAWStore } from '../../stores/dawStore';
import { AIInteraction } from '../../types/ai';
import { AIMelodyGenerator } from './AIMelodyGenerator';
import { TheoryExplanationModal } from './TheoryExplanationModal';
import { AIInstrumentDesigner } from './AIInstrumentDesigner';

interface AIAssistantPanelProps {
  visible: boolean;
  onClose: () => void;
}

type AIMode = 'chat' | 'melody' | 'theory' | 'instrument' | 'settings';

export function AIAssistantPanel({ visible, onClose }: AIAssistantPanelProps) {
  const [mode, setMode] = useState<AIMode>('chat');
  const [inputValue, setInputValue] = useState('');
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    aiHistory,
    aiGenerating,
    lastTheoryResponse,
    aiPreferences,
    currentProject,
    askAIQuestion,
    setAIPreferences,
    clearAIHistory,
    setAIApiKey
  } = useDAWStore();

  const [apiKey, setApiKeyInput] = useState('');

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiHistory]);

  const handleQuickQuestion = async (question: string) => {
    setInputValue(question);
    await handleAskQuestion(question);
  };

  const handleAskQuestion = async (question?: string) => {
    const finalQuestion = question || inputValue;
    if (!finalQuestion.trim()) return;

    await askAIQuestion(finalQuestion);
    setInputValue('');
    
    if (lastTheoryResponse) {
      setShowTheoryModal(true);
    }
  };

  const handleSaveApiKey = () => {
    setAIApiKey(apiKey);
    setApiKeyInput('');
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getInteractionIcon = (type: AIInteraction['type']) => {
    switch (type) {
      case 'melody': return '🎵';
      case 'theory': return '📚';
      case 'instrument': return '🎹';
      default: return '💬';
    }
  };

  const quickQuestions = [
    "Why does this chord progression work?",
    "What scale am I using here?",
    "How can I make this melody more interesting?",
    "What chord should I use next?",
    "Explain the theory behind this progression",
    "How do I add more tension to this melody?"
  ];

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              🤖 AI Assistant
              {aiGenerating && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex mt-3 space-x-1">
            {[
              { id: 'chat', label: '💬', title: 'Chat' },
              { id: 'melody', label: '🎵', title: 'Generate Melody' },
              { id: 'theory', label: '📚', title: 'Theory Help' },
              { id: 'instrument', label: '🎹', title: 'Create Instrument' },
              { id: 'settings', label: '⚙️', title: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as AIMode)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  mode === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={tab.title}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mode === 'chat' && (
            <div className="h-full flex flex-col">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiHistory.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <p className="mb-4">👋 Hi! I'm your AI music assistant.</p>
                    <p className="text-sm mb-6">Ask me questions about music theory, or use the tabs above to generate melodies and instruments.</p>
                    
                    {!currentProject && (
                      <div className="bg-yellow-900 bg-opacity-50 p-3 rounded mb-4">
                        <p className="text-yellow-300 text-sm">
                          💡 Create or load a project to get contextual theory help!
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="block w-full text-left text-xs bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors"
                          disabled={aiGenerating}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  aiHistory.map((interaction) => (
                    <div key={interaction.id} className="space-y-2">
                      <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-300">You</span>
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(interaction.timestamp)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{interaction.prompt}</p>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-300">AI</span>
                          <span>{getInteractionIcon(interaction.type)}</span>
                          <span className="text-xs text-gray-400">
                            {interaction.type}
                          </span>
                          {interaction.applied && (
                            <span className="text-xs bg-green-900 text-green-300 px-1 rounded">
                              applied
                            </span>
                          )}
                        </div>
                        
                        {interaction.type === 'theory' && (
                          <p className="text-gray-300 text-sm">
                            {(interaction.response as any).explanation}
                          </p>
                        )}
                        
                        {interaction.type === 'melody' && (
                          <div className="text-gray-300 text-sm">
                            <p>{(interaction.response as any).explanation}</p>
                            <div className="mt-2 text-xs text-gray-400">
                              Generated {(interaction.response as any).notes?.length || 0} notes
                              {(interaction.response as any).confidence && (
                                <span className="ml-2">
                                  Confidence: {Math.round((interaction.response as any).confidence * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {interaction.type === 'instrument' && (
                          <div className="text-gray-300 text-sm">
                            <p className="font-medium">{(interaction.response as any).presetName}</p>
                            <p>{(interaction.response as any).description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="Ask me about music theory..."
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    disabled={aiGenerating}
                  />
                  <button
                    onClick={() => handleAskQuestion()}
                    disabled={aiGenerating || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm"
                  >
                    {aiGenerating ? '...' : 'Ask'}
                  </button>
                </div>
                
                {aiHistory.length > 0 && (
                  <button
                    onClick={clearAIHistory}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-300"
                  >
                    Clear history
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'melody' && (
            <AIMelodyGenerator />
          )}

          {mode === 'theory' && (
            <div className="p-4">
              <h3 className="text-white font-medium mb-4">Theory Helper</h3>
              <div className="space-y-2 mb-6">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="block w-full text-left text-sm bg-gray-800 hover:bg-gray-700 p-3 rounded transition-colors"
                    disabled={aiGenerating}
                  >
                    {question}
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Ask a custom theory question..."
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm mb-2"
                  disabled={aiGenerating}
                />
                <button
                  onClick={() => handleAskQuestion()}
                  disabled={aiGenerating || !inputValue.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white py-2 rounded transition-colors text-sm"
                >
                  {aiGenerating ? 'Thinking...' : 'Ask Question'}
                </button>
              </div>
            </div>
          )}

          {mode === 'instrument' && (
            <AIInstrumentDesigner />
          )}

          {mode === 'settings' && (
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">AI Configuration</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter your OpenAI API key"
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                      />
                      <button
                        onClick={handleSaveApiKey}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded transition-colors text-sm"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Required for AI features. Your key is stored locally.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Preferences</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Theory Level</label>
                    <select
                      value={aiPreferences.theoryLevel}
                      onChange={(e) => setAIPreferences({ theoryLevel: e.target.value as any })}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Explanation Style</label>
                    <select
                      value={aiPreferences.explanationStyle}
                      onChange={(e) => setAIPreferences({ explanationStyle: e.target.value as any })}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="conversational">Conversational</option>
                      <option value="technical">Technical</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Creativity Level: {Math.round(aiPreferences.creativityLevel * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiPreferences.creativityLevel}
                      onChange={(e) => setAIPreferences({ creativityLevel: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Conservative</span>
                      <span>Experimental</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theory Explanation Modal */}
      {showTheoryModal && lastTheoryResponse && (
        <TheoryExplanationModal
          explanation={lastTheoryResponse}
          onClose={() => setShowTheoryModal(false)}
          onAskFollowUp={(question) => {
            setShowTheoryModal(false);
            handleQuickQuestion(question);
          }}
        />
      )}
    </>
  );
}