const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston API
const languageMap = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  css: { language: 'javascript', version: '18.15.0' }, // CSS will run as HTML preview
  html: { language: 'javascript', version: '18.15.0' }, // HTML will run as preview
};

export const executeCode = async (language, sourceCode) => {
  try {
    // Handle HTML/CSS differently - create preview instead of execution
    if (language === 'html' || language === 'css') {
      return {
        success: true,
        output: 'HTML/CSS preview generated',
        isPreview: true,
        htmlContent: language === 'html' ? sourceCode : `<style>${sourceCode}</style>`
      };
    }

    const config = languageMap[language];
    if (!config) {
      throw new Error(`Language ${language} is not supported`);
    }

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: sourceCode,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      output: data.run.stdout || data.run.stderr || 'No output',
      error: data.run.stderr || null,
      exitCode: data.run.code,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: `Execution failed: ${error.message}`,
    };
  }
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    html: 'html',
    css: 'css',
  };
  return extensions[language] || 'txt';
};
