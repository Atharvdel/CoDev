import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import toast from 'react-hot-toast';
import { executeCode } from '../services/codeExecution';
import ACTIONS from '../utils/Actions';

const Editor = ({ socketRef, roomId, onCodeChange, onLanguageChange }) => {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Welcome to SynCode!\nconsole.log("Hello, World!");');
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const languages = {
    javascript: { name: 'javascript', json: true },
    python: 'python',
    java: 'text/x-java',
    cpp: 'text/x-c++src',
    html: 'xml',
    css: 'css',
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
    };
    return extensions[lang] || lang;
  };

  const getExampleCode = (lang) => {
    const examples = {
      javascript: '// Welcome to SynCode!\nconsole.log("Hello, World!");',
      python: '# Welcome to SynCode!\nprint("Hello, World!")',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>Welcome to SynCode!</p>\n</body>\n</html>',
      css: '/* Welcome to SynCode! */\nbody {\n    font-family: Arial, sans-serif;\n    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    text-align: center;\n    padding: 50px;\n}\n\nh1 {\n    font-size: 3em;\n    margin-bottom: 20px;\n}',
    };
    return examples[lang] || '';
  };

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: languages[language],
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          styleActiveLine: false,
          value: code,
        }
      );

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const newCode = instance.getValue();
        setCode(newCode);
        onCodeChange(newCode);

        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code: newCode,
          });
        }
      });
    }

    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorRef.current) {
          const cursor = editorRef.current.getCursor();
          const scrollInfo = editorRef.current.getScrollInfo();
          
          editorRef.current.setValue(code);
          setCode(code);
          
          try {
            editorRef.current.setCursor(cursor);
            editorRef.current.scrollTo(scrollInfo.left, scrollInfo.top);
          } catch (e) {
            const lastLine = editorRef.current.lastLine();
            const lastLineLength = editorRef.current.getLine(lastLine).length;
            editorRef.current.setCursor({ line: lastLine, ch: lastLineLength });
          }
        }
      });

      socketRef.current.on('language_change', ({ language: newLanguage, username }) => {
        setLanguage(newLanguage);
        if (editorRef.current) {
          editorRef.current.setOption('mode', languages[newLanguage]);
          const exampleCode = getExampleCode(newLanguage);
          editorRef.current.setValue(exampleCode);
          setCode(exampleCode);
        }
        
        toast.success(`${username} changed language to ${newLanguage}`, {
          duration: 2000,
          style: {
            background: '#161b22',
            color: '#f0f6fc',
            border: '1px solid #30363d',
            borderLeft: '4px solid #58a6ff',
          },
        });
      });

      socketRef.current.on(ACTIONS.JOINED, ({ currentLanguage }) => {
        if (currentLanguage && currentLanguage !== language) {
          setLanguage(currentLanguage);
          if (editorRef.current) {
            editorRef.current.setOption('mode', languages[currentLanguage]);
          }
        }
      });
    }

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
      socketRef.current?.off('language_change');
    };
  }, [socketRef.current]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    
    if (editorRef.current) {
      editorRef.current.setOption('mode', languages[newLanguage]);
      const exampleCode = getExampleCode(newLanguage);
      editorRef.current.setValue(exampleCode);
      setCode(exampleCode);
    }

    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }

    if (socketRef.current) {
      socketRef.current.emit('language_change', {
        roomId,
        language: newLanguage,
        username: localStorage.getItem('username') || 'Anonymous'
      });
    }

    toast.success(`Language changed to ${newLanguage}`, {
      duration: 1500,
      style: {
        background: '#161b22',
        color: '#f0f6fc',
        border: '1px solid #30363d',
        borderLeft: '4px solid #56d364',
      },
    });
  };

  const toggleOutput = () => {
    setShowOutput(!showOutput);
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    // Auto-show output when running code
    if (!showOutput) {
      setShowOutput(true);
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
        
        toast.success('Code executed successfully!', {
          duration: 2000,
          style: {
            background: '#161b22',
            color: '#f0f6fc',
            border: '1px solid #30363d',
            borderLeft: '4px solid #56d364',
          },
        });
      } else {
        setIsError(true);
        setOutput(result.error || 'Execution failed');
        toast.error('Code execution failed');
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
    <div className="editor-container">
      {/* Top Header */}
      <div className="editor-header">
        <span className="editor-title">
          main.{getFileExtension(language)}
        </span>
        
        <div className="editor-controls">
          <select 
            className="language-selector"
            value={language} 
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          <button 
            className={`output-toggle ${showOutput ? 'active' : ''}`}
            onClick={toggleOutput}
          >
            {showOutput ? '📝 Hide Output' : '👁️ Show Output'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`editor-layout ${showOutput ? 'split' : 'full'}`}>
        <div className="editor-pane">
          <textarea id="realtimeEditor"></textarea>
        </div>

        {showOutput && (
          <div className="output-pane">
            <div className="output-container">
              <div className="output-header">
                <h3 className="output-title">Output</h3>
                <button className="clear-btn" onClick={clearOutput}>
                  🗑️ Clear
                </button>
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
          </div>
        )}
      </div>

      {/* Bottom Footer with Run Button */}
      <div className="editor-footer">
        <div className="footer-info">
          <span className="language-info">Language: {language}</span>
          <span className="lines-info">
            Lines: {code.split('\n').length}
          </span>
        </div>
        
        <button 
          className={`run-code-btn ${isLoading ? 'loading' : ''}`}
          onClick={runCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Running...
            </>
          ) : (
            <>
              ▶️ Run Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Editor;
