import React, { useState } from 'react';
import { AITheoryResponse } from '../../types/ai';

interface TheoryExplanationModalProps {
  explanation: AITheoryResponse;
  onClose: () => void;
  onAskFollowUp: (question: string) => void;
}

export function TheoryExplanationModal({ 
  explanation, 
  onClose, 
  onAskFollowUp 
}: TheoryExplanationModalProps) {
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  const handleAskFollowUp = () => {
    if (followUpQuestion.trim()) {
      onAskFollowUp(followUpQuestion);
      setFollowUpQuestion('');
    }
  };

  const handleQuickFollowUp = (question: string) => {
    onAskFollowUp(question);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-51 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              📚 Theory Explanation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Main Explanation */}
            <div className="prose prose-invert max-w-none mb-6">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {explanation.explanation}
              </div>
            </div>

            {/* Theory Concepts */}
            {explanation.concepts && explanation.concepts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {explanation.concepts.map((concept, index) => (
                    <span
                      key={index}
                      className="bg-earth-purple-900 bg-opacity-50 text-earth-purple-200 px-3 py-1 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Examples */}
            {explanation.examples?.audioSnippets && explanation.examples.audioSnippets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Musical Examples</h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    Audio examples would be rendered here in a full implementation
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    {explanation.examples.audioSnippets.length} example(s) available
                  </div>
                </div>
              </div>
            )}

            {/* Chord Diagrams */}
            {explanation.examples?.visualizations && explanation.examples.visualizations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Visual Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {explanation.examples.visualizations.map((viz, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        {viz.chord.root} {viz.chord.quality}
                        {viz.chord.extensions.length > 0 && (
                          <span className="ml-1 text-gray-400">
                            ({viz.chord.extensions.join(', ')})
                          </span>
                        )}
                      </h4>
                      <div className="text-xs text-gray-400">
                        {viz.visualization} view
                      </div>
                      {viz.highlights && viz.highlights.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Highlighting positions: {viz.highlights.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Exercises */}
            {explanation.practiceExercises && explanation.practiceExercises.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Practice Exercises</h3>
                <div className="space-y-3">
                  {explanation.practiceExercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-300 text-sm mb-2">{exercise.description}</p>
                      <div className="text-xs text-gray-400">
                        {exercise.targetNotes.length} notes to practice with
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Questions */}
            {explanation.relatedQuestions && explanation.relatedQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Related Questions</h3>
                <div className="space-y-2">
                  {explanation.relatedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickFollowUp(question)}
                      className="block w-full text-left text-sm bg-gray-800 hover:bg-gray-700 p-3 rounded transition-colors border border-gray-700 hover:border-gray-600"
                    >
                      <span className="text-gray-400 mr-2">Q:</span>
                      <span className="text-gray-300">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Follow-up Question */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Ask a Follow-up Question</h4>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskFollowUp()}
                  placeholder="Ask for more details or a related question..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-earth-purple-500 focus:outline-none text-sm"
                />
                <button
                  onClick={handleAskFollowUp}
                  disabled={!followUpQuestion.trim()}
                  className="bg-earth-purple-600 hover:bg-earth-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Ask
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['Can you give me an example?', 'How do I practice this?', 'What should I learn next?'].map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuickFollowUp(question)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}