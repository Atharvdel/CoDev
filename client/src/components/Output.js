import React, { useState } from 'react';
import { executeCode } from '../services/codeExecution';
import toast from 'react-hot-toast';

const Output = ({ code, language }) => {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setOutput('');

    try {
      const result = await executeCode(language, code);
      
      if (result.success) {
        if (result.isPreview) {
          setShowPreview(true);
          setOutput(result.htmlContent);
        } else {
          setShowPreview(false);
          setOutput(result.output);
          setIsError(!!result.error);
        }
      } else {
        setIsError(true);
        setOutput(result.error || 'Execution failed');
      }
    } catch (error) {
      setIsError(true);
      setOutput(`Error: ${error.message}`);
      toast.error('Failed to execute code');
    } finally {
      setIsLoading(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setIsError(false);
    setShowPreview(false);
  };

  return (
    <div className="output-container">
      <div className="output-header">
        <h3 className="output-title">Output</h3>
        <div className="output-actions">
          <button 
            className={`run-btn ${isLoading ? 'loading' : ''}`}
            onClick={runCode}
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : '▶ Run Code'}
          </button>
          <button className="clear-btn" onClick={clearOutput}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className={`output-content ${isError ? 'error' : ''}`}>
        {showPreview ? (
          <iframe
            srcDoc={output}
            className="html-preview"
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        ) : (
          <pre className="output-text">
            {output || 'No output yet. Click "Run Code" to execute your code.'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Output;
