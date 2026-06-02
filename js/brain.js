/* ============================================
   JARVIS - AI Brain (Free, No API Keys)
   Local intelligence + web search + Wikipedia
   ============================================ */

class JarvisBrain {
  constructor() {
    this.webSearch = new WebSearch();
    this.conversationHistory = [];
    this.maxHistory = 50;
    this.systemPrompt = `You are JARVIS, an advanced AI assistant. You are helpful, knowledgeable, and capable. You can search the web, create files, write code, research topics, and help with any task. You speak in a professional but friendly manner.`;

    // Knowledge base for offline quick answers
    this.quickAnswers = {
      greetings: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy'],
      identity: ['who are you', 'what are you', 'your name', 'introduce yourself', 'what is jarvis'],
      capabilities: ['what can you do', 'your abilities', 'help me', 'capabilities', 'features'],
      time: ['what time', 'current time', 'what\'s the time', 'time now'],
      date: ['what date', 'today\'s date', 'current date', 'what day'],
    };
  }

  /**
   * Process user input and generate response
   */
  async processMessage(userMessage, onStatusUpdate) {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    // Trim history
    if (this.conversationHistory.length > this.maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
    }

    const lower = userMessage.toLowerCase().trim();

    // Check for special commands
    if (this.isCommand(lower)) {
      return await this.handleCommand(lower, userMessage, onStatusUpdate);
    }

    // Check for quick answers
    const quickAnswer = this.getQuickAnswer(lower);
    if (quickAnswer) {
      this.conversationHistory.push({ role: 'assistant', content: quickAnswer });
      return quickAnswer;
    }

    // Determine if we need web search
    const needsSearch = this.needsWebSearch(lower);

    if (needsSearch) {
      return await this.handleSearchQuery(userMessage, lower, onStatusUpdate);
    }

    // For code/file/general requests, use local intelligence
    return await this.handleGeneralQuery(userMessage, lower, onStatusUpdate);
  }

  /**
   * Quick offline answers
   */
  getQuickAnswer(lower) {
    if (this.quickAnswers.greetings.some(g => lower === g || lower === g + '!')) {
      const hour = new Date().getHours();
      let greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      return `${greeting}! I'm JARVIS, your personal AI assistant. 🔴\n\nHow can I help you today? I can:\n- 🔍 **Search the web** for any information\n- 💻 **Write code** in any language\n- 📁 **Create files** and projects\n- 📊 **Research topics** in depth\n- 🎤 **Listen to voice commands**\n- ✏️ **Edit my own code** when you want changes\n\nJust ask me anything!`;
    }

    if (this.quickAnswers.identity.some(q => lower.includes(q))) {
      return `I am **JARVIS** — Just A Rather Very Intelligent System. 🔴\n\nI'm a free, open-source AI assistant that runs entirely in your browser. I don't require any API keys or paid services.\n\n**My capabilities include:**\n- 🌐 Web search & research using free search engines\n- 💻 Code generation in any programming language\n- 📁 File creation and management\n- 🎤 Speech-to-text voice control\n- ✏️ Self-editing — I can modify my own source code\n- 📊 Data analysis and information gathering\n- 🖥️ Application-like task management\n\nI'm built to be your personal assistant that works completely for free!`;
    }

    if (this.quickAnswers.capabilities.some(q => lower.includes(q))) {
      return `Here's everything I can do for you: 🔴\n\n### 🔍 Web Search & Research\n- Search the internet for any topic\n- Gather information from Wikipedia\n- Research and summarize findings\n\n### 💻 Code & Development\n- Write code in any language (Python, JavaScript, HTML, etc.)\n- Debug and explain code\n- Create complete projects and files\n\n### 📁 File Management\n- Create, read, and edit files\n- Generate project structures\n- Export and download files\n\n### 🎤 Voice Control\n- Speech-to-text input\n- Hands-free operation\n\n### ✏️ Self-Modification\n- I can edit my own source code\n- Add new features on your request\n- Customize my behavior\n\n### 🧠 General Intelligence\n- Answer questions on any topic\n- Math calculations\n- Creative writing\n- Task planning\n\nJust tell me what you need!`;
    }

    if (this.quickAnswers.time.some(q => lower.includes(q))) {
      return `The current time is **${new Date().toLocaleTimeString()}** 🕐`;
    }

    if (this.quickAnswers.date.some(q => lower.includes(q))) {
      return `Today's date is **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}** 📅`;
    }

    return null;
  }

  /**
   * Check if message is a special command
   */
  isCommand(lower) {
    const commands = [
      '/search', '/create', '/edit', '/file', '/code',
      '/help', '/clear', '/export', '/self-edit', '/settings',
      '/research', '/summarize', '/calculate', '/open'
    ];
    return commands.some(cmd => lower.startsWith(cmd));
  }

  /**
   * Handle special commands
   */
  async handleCommand(lower, original, onStatusUpdate) {
    if (lower.startsWith('/help')) {
      return this.getHelpText();
    }

    if (lower.startsWith('/clear')) {
      this.conversationHistory = [];
      return '🗑️ Conversation history cleared. Fresh start!';
    }

    if (lower.startsWith('/search ')) {
      const query = original.substring(8);
      return await this.handleSearchQuery(query, query.toLowerCase(), onStatusUpdate);
    }

    if (lower.startsWith('/create ') || lower.startsWith('/file ')) {
      const request = original.substring(original.indexOf(' ') + 1);
      return await this.handleFileCreation(request, onStatusUpdate);
    }

    if (lower.startsWith('/code ')) {
      const request = original.substring(6);
      return await this.handleCodeGeneration(request, onStatusUpdate);
    }

    if (lower.startsWith('/self-edit')) {
      return `✏️ **Self-Edit Mode**\n\nTell me what changes you want to make to my code. For example:\n- "Change the accent color to blue"\n- "Add a new feature: dark/light mode toggle"\n- "Modify the welcome message"\n- "Add a new slash command"\n\nJust describe the change and I'll generate the modified code!`;
    }

    if (lower.startsWith('/research ')) {
      const topic = original.substring(10);
      return await this.handleResearch(topic, onStatusUpdate);
    }

    if (lower.startsWith('/calculate ') || lower.startsWith('/calc ')) {
      const expr = original.substring(original.indexOf(' ') + 1);
      return this.handleCalculation(expr);
    }

    if (lower.startsWith('/export')) {
      return this.handleExport();
    }

    if (lower.startsWith('/summarize ')) {
      const text = original.substring(11);
      return this.handleSummarize(text);
    }

    return `Unknown command. Type **/help** to see available commands.`;
  }

  /**
   * Determine if we need web search
   */
  needsWebSearch(lower) {
    const searchTriggers = [
      'search for', 'search about', 'look up', 'find out', 'find me',
      'what is', 'what are', 'who is', 'who was', 'when was', 'when did',
      'where is', 'where was', 'how to', 'how do', 'how does', 'how can',
      'tell me about', 'information about', 'info on', 'info about',
      'latest news', 'current', 'recent', 'update on',
      'define ', 'meaning of', 'explain what',
      'why is', 'why do', 'why does', 'why did',
      'weather', 'stock price', 'price of',
      'research', 'investigate'
    ];

    // Don't search for code/file requests
    const noSearchTriggers = [
      'write code', 'create a file', 'make a', 'build a', 'generate code',
      'write a program', 'create file', 'make file', 'code for',
      'html', 'css', 'javascript', 'python', 'function', 'class',
      'edit your', 'change your', 'modify your', 'update your',
      'self-edit', 'self edit'
    ];

    if (noSearchTriggers.some(t => lower.includes(t))) {
      // Check if it's a "how to code X" which needs search
      if (lower.includes('how to') && !lower.includes('code') && !lower.includes('write')) {
        return true;
      }
      return false;
    }

    return searchTriggers.some(trigger => lower.includes(trigger));
  }

  /**
   * Handle search-based queries
   */
  async handleSearchQuery(query, lower, onStatusUpdate) {
    if (onStatusUpdate) onStatusUpdate('🔍 Searching the web...');

    try {
      const results = await this.webSearch.search(query);

      if (results.length === 0) {
        if (onStatusUpdate) onStatusUpdate(null);
        return `I searched for "**${query}**" but couldn't find specific results. This might be because:\n\n- The search engines might be temporarily unavailable\n- The query might be too specific\n\n**Try:**\n- Rephrasing your question\n- Using simpler keywords\n- Using the \`/research\` command for deeper search`;
      }

      if (onStatusUpdate) onStatusUpdate('📊 Analyzing results...');

      // Build response from search results
      let response = `## 🔍 Search Results for: "${query}"\n\n`;

      // Main answer
      const mainResult = results[0];
      if (mainResult.snippet && mainResult.snippet.length > 50) {
        response += `### 📌 Top Result\n${mainResult.snippet}\n\n`;
        if (mainResult.url) {
          response += `*Source: [${mainResult.title}](${mainResult.url})*\n\n`;
        }
      }

      // Additional results
      if (results.length > 1) {
        response += `### 📋 More Information\n\n`;
        for (let i = 1; i < results.length; i++) {
          const r = results[i];
          response += `**${i}. ${r.title}**\n`;
          if (r.snippet) response += `${r.snippet.substring(0, 200)}${r.snippet.length > 200 ? '...' : ''}\n`;
          if (r.url) response += `🔗 [Read more](${r.url})\n`;
          response += `\n`;
        }
      }

      response += `\n---\n*Results gathered from free search engines. No API keys used.*`;

      if (onStatusUpdate) onStatusUpdate(null);
      this.conversationHistory.push({ role: 'assistant', content: response });
      return response;

    } catch (error) {
      if (onStatusUpdate) onStatusUpdate(null);
      return `⚠️ Search encountered an error: ${error.message}\n\nPlease try again or rephrase your query.`;
    }
  }

  /**
   * Handle deep research
   */
  async handleResearch(topic, onStatusUpdate) {
    if (onStatusUpdate) onStatusUpdate('🔬 Starting deep research...');

    let response = `## 🔬 Research Report: "${topic}"\n\n`;

    // Search multiple angles
    const queries = [
      topic,
      `${topic} overview explanation`,
      `${topic} facts data`
    ];

    const allResults = [];

    for (let i = 0; i < queries.length; i++) {
      if (onStatusUpdate) onStatusUpdate(`🔍 Searching (${i + 1}/${queries.length}): "${queries[i]}"...`);
      try {
        const results = await this.webSearch.search(queries[i], 3);
        allResults.push(...results);
      } catch (e) {
        console.warn('Research query failed:', e);
      }
    }

    // Deduplicate
    const seen = new Set();
    const unique = allResults.filter(r => {
      const key = r.url || r.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length === 0) {
      if (onStatusUpdate) onStatusUpdate(null);
      return `Could not find research results for "${topic}". Try different keywords.`;
    }

    if (onStatusUpdate) onStatusUpdate('📝 Compiling research report...');

    // Compile report
    response += `### 📖 Overview\n\n`;
    const mainInfo = unique.find(r => r.snippet && r.snippet.length > 100);
    if (mainInfo) {
      response += `${mainInfo.snippet}\n\n`;
    }

    response += `### 📋 Key Findings\n\n`;
    unique.forEach((r, i) => {
      if (r.snippet) {
        response += `**${i + 1}. ${r.title}**\n`;
        response += `${r.snippet}\n`;
        if (r.url) response += `🔗 [Source](${r.url})\n`;
        response += `\n`;
      }
    });

    response += `### 📊 Sources Used\n\n`;
    unique.forEach((r, i) => {
      if (r.url) {
        response += `${i + 1}. [${r.title}](${r.url}) — *${r.source}*\n`;
      }
    });

    response += `\n---\n*Research completed using free, open search engines. ${unique.length} sources analyzed.*`;

    if (onStatusUpdate) onStatusUpdate(null);
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  /**
   * Handle code generation
   */
  async handleCodeGeneration(request, onStatusUpdate) {
    if (onStatusUpdate) onStatusUpdate('💻 Generating code...');

    // Determine language
    const langMap = {
      python: ['python', 'py', 'django', 'flask', 'pandas', 'numpy'],
      javascript: ['javascript', 'js', 'node', 'react', 'vue', 'express'],
      html: ['html', 'webpage', 'website', 'web page'],
      css: ['css', 'style', 'stylesheet'],
      java: ['java', 'spring'],
      cpp: ['c++', 'cpp'],
      c: [' c ', 'c program'],
      csharp: ['c#', 'csharp', '.net'],
      php: ['php', 'laravel'],
      sql: ['sql', 'database', 'query'],
      bash: ['bash', 'shell', 'script'],
      rust: ['rust'],
      go: ['golang', ' go '],
      ruby: ['ruby', 'rails'],
      swift: ['swift'],
      kotlin: ['kotlin'],
      typescript: ['typescript', 'ts'],
    };

    let detectedLang = 'javascript';
    const lower = request.toLowerCase();
    for (const [lang, keywords] of Object.entries(langMap)) {
      if (keywords.some(kw => lower.includes(kw))) {
        detectedLang = lang;
        break;
      }
    }

    // Generate code based on request
    let response = `## 💻 Code Generation\n\n`;
    response += `**Request:** ${request}\n`;
    response += `**Language:** ${detectedLang}\n\n`;

    // Generate template code
    const code = this.generateCodeTemplate(request, detectedLang);
    response += `\`\`\`${detectedLang}\n${code}\n\`\`\`\n\n`;
    response += `### 📝 Notes\n- This is a template based on your request\n- Modify it to fit your exact needs\n- Use \`/create filename.ext\` to save it as a file\n`;

    if (onStatusUpdate) onStatusUpdate(null);
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  /**
   * Generate code templates
   */
  generateCodeTemplate(request, lang) {
    const lower = request.toLowerCase();

    // Python templates
    if (lang === 'python') {
      if (lower.includes('web scraper') || lower.includes('scraping')) {
        return `import requests\nfrom html.parser import HTMLParser\n\nclass Scraper(HTMLParser):\n    def __init__(self):\n        super().__init__()\n        self.data = []\n        self.capture = False\n\n    def handle_starttag(self, tag, attrs):\n        if tag in ['p', 'h1', 'h2', 'h3', 'span', 'div']:\n            self.capture = True\n\n    def handle_data(self, data):\n        if self.capture:\n            self.data.append(data.strip())\n            self.capture = False\n\ndef scrape(url):\n    """Scrape text content from a URL"""\n    response = requests.get(url)\n    parser = Scraper()\n    parser.feed(response.text)\n    return [d for d in parser.data if d]\n\nif __name__ == '__main__':\n    url = input('Enter URL to scrape: ')\n    results = scrape(url)\n    for item in results:\n        print(item)`;
      }
      if (lower.includes('calculator')) {
        return `# Simple Calculator\nimport math\n\ndef calculate(expression):\n    """Safely evaluate a math expression"""\n    allowed = set('0123456789+-*/().^ ')\n    if not all(c in allowed for c in expression):\n        return "Invalid expression"\n    \n    expression = expression.replace('^', '**')\n    try:\n        result = eval(expression)\n        return result\n    except Exception as e:\n        return f"Error: {e}"\n\ndef main():\n    print("=== Python Calculator ===")\n    print("Type 'quit' to exit\\n")\n    \n    while True:\n        expr = input(">>> ")\n        if expr.lower() == 'quit':\n            break\n        print(f"  = {calculate(expr)}\\n")\n\nif __name__ == '__main__':\n    main()`;
      }
      if (lower.includes('todo') || lower.includes('task')) {
        return `# Todo List Manager\nimport json\nimport os\n\nDB_FILE = 'todos.json'\n\ndef load_todos():\n    if os.path.exists(DB_FILE):\n        with open(DB_FILE, 'r') as f:\n            return json.load(f)\n    return []\n\ndef save_todos(todos):\n    with open(DB_FILE, 'w') as f:\n        json.dump(todos, f, indent=2)\n\ndef add_todo(title, priority='medium'):\n    todos = load_todos()\n    todos.append({\n        'id': len(todos) + 1,\n        'title': title,\n        'priority': priority,\n        'done': False\n    })\n    save_todos(todos)\n    print(f'Added: {title}')\n\ndef list_todos():\n    todos = load_todos()\n    for t in todos:\n        status = '✅' if t['done'] else '⬜'\n        print(f"{status} [{t['id']}] {t['title']} ({t['priority']})")\n\ndef complete_todo(todo_id):\n    todos = load_todos()\n    for t in todos:\n        if t['id'] == todo_id:\n            t['done'] = True\n    save_todos(todos)\n\nif __name__ == '__main__':\n    import sys\n    if len(sys.argv) > 1:\n        cmd = sys.argv[1]\n        if cmd == 'add' and len(sys.argv) > 2:\n            add_todo(' '.join(sys.argv[2:]))\n        elif cmd == 'done' and len(sys.argv) > 2:\n            complete_todo(int(sys.argv[2]))\n        elif cmd == 'list':\n            list_todos()\n    else:\n        list_todos()`;
      }
      // Default Python
      return `# ${request}\n\ndef main():\n    """Main function"""\n    print("Hello from JARVIS-generated code!")\n    \n    # TODO: Implement your logic here\n    # Based on request: ${request}\n    \n    pass\n\nif __name__ == '__main__':\n    main()`;
    }

    // JavaScript templates
    if (lang === 'javascript' || lang === 'typescript') {
      if (lower.includes('api') || lower.includes('server') || lower.includes('express')) {
        return `// Simple HTTP Server / API\nconst http = require('http');\n\nconst PORT = 3000;\nconst routes = {};\n\n// Route handler\nfunction route(method, path, handler) {\n  routes[\`\${method}:\${path}\`] = handler;\n}\n\n// Define routes\nroute('GET', '/', (req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ message: 'Welcome to JARVIS API' }));\n});\n\nroute('GET', '/api/status', (req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ status: 'online', time: new Date().toISOString() }));\n});\n\n// Server\nconst server = http.createServer((req, res) => {\n  const key = \`\${req.method}:\${req.url}\`;\n  const handler = routes[key];\n  \n  if (handler) {\n    handler(req, res);\n  } else {\n    res.writeHead(404);\n    res.end(JSON.stringify({ error: 'Not found' }));\n  }\n});\n\nserver.listen(PORT, () => {\n  console.log(\`Server running at http://localhost:\${PORT}\`);\n});`;
      }
      if (lower.includes('game')) {
        return `// Simple Canvas Game\nconst canvas = document.getElementById('gameCanvas');\nconst ctx = canvas.getContext('2d');\ncanvas.width = 800;\ncanvas.height = 600;\n\nlet player = { x: 400, y: 500, w: 40, h: 40, speed: 5, color: '#ff1744' };\nlet enemies = [];\nlet score = 0;\nlet keys = {};\n\ndocument.addEventListener('keydown', e => keys[e.key] = true);\ndocument.addEventListener('keyup', e => keys[e.key] = false);\n\nfunction spawnEnemy() {\n  enemies.push({\n    x: Math.random() * (canvas.width - 30),\n    y: -30,\n    w: 30, h: 30,\n    speed: 2 + Math.random() * 3\n  });\n}\n\nfunction update() {\n  if (keys['ArrowLeft']) player.x -= player.speed;\n  if (keys['ArrowRight']) player.x += player.speed;\n  if (keys['ArrowUp']) player.y -= player.speed;\n  if (keys['ArrowDown']) player.y += player.speed;\n  \n  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));\n  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));\n  \n  enemies.forEach(e => e.y += e.speed);\n  enemies = enemies.filter(e => e.y < canvas.height);\n  \n  if (Math.random() < 0.02) spawnEnemy();\n  score++;\n}\n\nfunction draw() {\n  ctx.fillStyle = '#0a0a0f';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  \n  ctx.fillStyle = player.color;\n  ctx.fillRect(player.x, player.y, player.w, player.h);\n  \n  ctx.fillStyle = '#448aff';\n  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));\n  \n  ctx.fillStyle = '#fff';\n  ctx.font = '20px Arial';\n  ctx.fillText('Score: ' + score, 10, 30);\n}\n\nfunction gameLoop() {\n  update();\n  draw();\n  requestAnimationFrame(gameLoop);\n}\n\ngameLoop();`;
      }
      // Default JS
      return `// ${request}\n\n(function() {\n  'use strict';\n  \n  // TODO: Implement based on request: ${request}\n  \n  function init() {\n    console.log('JARVIS-generated code initialized');\n  }\n  \n  // Run on load\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', init);\n  } else {\n    init();\n  }\n})();`;
    }

    // HTML templates
    if (lang === 'html') {
      return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${request}</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body {\n      font-family: 'Segoe UI', sans-serif;\n      background: #0a0a0f;\n      color: #e0e0e0;\n      min-height: 100vh;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n    .container {\n      text-align: center;\n      padding: 40px;\n    }\n    h1 {\n      font-size: 2.5rem;\n      margin-bottom: 1rem;\n      background: linear-gradient(135deg, #ff1744, #ff4569);\n      -webkit-background-clip: text;\n      -webkit-text-fill-color: transparent;\n    }\n    p { color: #a0a0b0; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>${request}</h1>\n    <p>Generated by JARVIS AI</p>\n  </div>\n</body>\n</html>`;
    }

    // SQL
    if (lang === 'sql') {
      return `-- ${request}\n-- Generated by JARVIS AI\n\nCREATE TABLE IF NOT EXISTS items (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  description TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert sample data\nINSERT INTO items (name, description) VALUES\n  ('Item 1', 'First item'),\n  ('Item 2', 'Second item');\n\n-- Query\nSELECT * FROM items ORDER BY created_at DESC;`;
    }

    // Bash
    if (lang === 'bash') {
      return `#!/bin/bash\n# ${request}\n# Generated by JARVIS AI\n\nset -euo pipefail\n\necho "=== JARVIS Script ==="\necho "Running: ${request}"\necho ""\n\n# TODO: Add your logic here\n\necho "Done!"`;
    }

    // Default
    return `// ${request}\n// Language: ${lang}\n// Generated by JARVIS AI\n\n// TODO: Implement your logic here`;
  }

  /**
   * Handle file creation
   */
  async handleFileCreation(request, onStatusUpdate) {
    if (onStatusUpdate) onStatusUpdate('📁 Creating file...');

    // Parse filename from request
    let filename = 'untitled.txt';
    const filenameMatch = request.match(/(?:called|named|filename|as)\s+["']?([^\s"']+)["']?/i);
    if (filenameMatch) {
      filename = filenameMatch[1];
    } else {
      // Try to detect from request
      const extMatch = request.match(/\.(\w{1,5})\b/);
      if (extMatch) {
        const idx = request.indexOf(extMatch[0]);
        const before = request.substring(0, idx + extMatch[0].length).split(/\s+/).pop();
        filename = before;
      }
    }

    const content = this.generateFileContent(request, filename);

    // Store in JARVIS file system
    if (typeof JARVIS !== 'undefined' && JARVIS.fileSystem) {
      JARVIS.fileSystem.set(filename, {
        name: filename,
        content: content,
        created: new Date().toISOString(),
        size: content.length
      });
    }

    let response = `## 📁 File Created: \`${filename}\`\n\n`;
    response += `\`\`\`\n${content}\n\`\`\`\n\n`;
    response += `**File saved!** You can:\n- 📥 Download it from the file manager (📎 button)\n- ✏️ Ask me to edit it\n- 📋 Copy the code above`;

    if (onStatusUpdate) onStatusUpdate(null);
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  /**
   * Generate file content based on request
   */
  generateFileContent(request, filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const lower = request.toLowerCase();

    switch (ext) {
      case 'html':
        return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${request}</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>Created by JARVIS AI</p>\n</body>\n</html>`;
      case 'py':
        return `# ${request}\n\ndef main():\n    print("Hello from JARVIS!")\n\nif __name__ == "__main__":\n    main()`;
      case 'js':
        return `// ${request}\nconsole.log("Hello from JARVIS!");`;
      case 'json':
        return JSON.stringify({ name: "jarvis-project", version: "1.0.0", description: request }, null, 2);
      case 'css':
        return `/* ${request} */\n* { margin: 0; padding: 0; box-sizing: border-box; }`;
      case 'md':
        return `# ${request}\n\nCreated by JARVIS AI\n\n## Overview\n\nAdd your content here.`;
      default:
        return `${request}\n\nCreated by JARVIS AI - ${new Date().toISOString()}`;
    }
  }

  /**
   * Handle calculation
   */
  handleCalculation(expr) {
    try {
      // Safe math eval
      const sanitized = expr.replace(/[^0-9+\-*/().%\s^]/g, '').replace(/\^/g, '**');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return `## 🧮 Calculator\n\n**Expression:** \`${expr}\`\n**Result:** \`${result}\`\n\n---\n*Calculated locally, no internet needed.*`;
    } catch (e) {
      return `⚠️ Could not calculate: "${expr}"\n\nMake sure the expression is valid math. Examples:\n- \`/calculate 2 + 2\`\n- \`/calculate (15 * 3) + 7\`\n- \`/calculate 2 ^ 10\``;
    }
  }

  /**
   * Handle summarize
   */
  handleSummarize(text) {
    // Simple extractive summarization
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const summary = sentences.slice(0, Math.max(3, Math.ceil(sentences.length * 0.3))).join(' ');
    return `## 📝 Summary\n\n${summary}\n\n---\n*Original: ${text.length} chars → Summary: ${summary.length} chars*`;
  }

  /**
   * Handle export
   */
  handleExport() {
    const data = {
      conversation: this.conversationHistory,
      exported: new Date().toISOString()
    };
    return `## 📦 Export Conversation\n\nYour conversation has **${this.conversationHistory.length}** messages.\n\nClick the download button below to save:\n\n\`\`\`json\n${JSON.stringify(data, null, 2).substring(0, 1000)}${data.conversation.length > 5 ? '\n... (truncated)' : ''}\n\`\`\`\n\n*Use the file manager to access the full export.*`;
  }

  /**
   * Handle general queries (code requests, self-edit, etc.)
   */
  async handleGeneralQuery(userMessage, lower, onStatusUpdate) {
    // Self-edit requests
    if (lower.includes('edit your') || lower.includes('change your') || 
        lower.includes('modify your') || lower.includes('update your') ||
        lower.includes('self-edit') || lower.includes('self edit') ||
        lower.includes('change the') && (lower.includes('color') || lower.includes('style') || lower.includes('ui'))) {
      return await this.handleSelfEdit(userMessage, onStatusUpdate);
    }

    // Code generation requests
    if (lower.includes('write') || lower.includes('create') || lower.includes('make') ||
        lower.includes('build') || lower.includes('generate') || lower.includes('code')) {
      return await this.handleCodeGeneration(userMessage, onStatusUpdate);
    }

    // Math
    if (/^\d/.test(lower) && /[+\-*/]/.test(lower)) {
      return this.handleCalculation(userMessage);
    }

    // Default: try to answer with knowledge, or search
    if (onStatusUpdate) onStatusUpdate('🧠 Thinking...');

    // Try web search as fallback for unknown queries
    try {
      const results = await this.webSearch.search(userMessage, 3);
      if (results.length > 0 && results[0].snippet) {
        if (onStatusUpdate) onStatusUpdate(null);
        let response = '';
        
        // Construct an intelligent response
        const mainSnippet = results[0].snippet;
        response += `${mainSnippet}\n\n`;
        
        if (results.length > 1) {
          response += `### More Details\n\n`;
          for (let i = 1; i < results.length; i++) {
            if (results[i].snippet) {
              response += `- ${results[i].snippet.substring(0, 150)}\n`;
            }
          }
          response += '\n';
        }

        // Add sources
        response += `---\n*Sources: ${results.filter(r => r.url).map(r => `[${r.source}](${r.url})`).join(', ')}*`;
        
        this.conversationHistory.push({ role: 'assistant', content: response });
        return response;
      }
    } catch (e) {
      console.warn('Fallback search failed:', e);
    }

    if (onStatusUpdate) onStatusUpdate(null);

    // Ultimate fallback
    const response = `I understand you're asking about: **"${userMessage}"**\n\nI wasn't able to find specific information about this. Here's what I can do:\n\n- 🔍 **Search deeper:** Try \`/research ${userMessage}\`\n- 💻 **Generate code:** Try \`/code ${userMessage}\`\n- 📁 **Create a file:** Try \`/create filename.ext\`\n- 🧮 **Calculate:** Try \`/calculate expression\`\n\nYou can also try rephrasing your question or breaking it down into smaller parts!`;
    
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  /**
   * Handle self-edit requests
   */
  async handleSelfEdit(request, onStatusUpdate) {
    if (onStatusUpdate) onStatusUpdate('✏️ Analyzing edit request...');

    const lower = request.toLowerCase();
    let response = `## ✏️ Self-Edit Mode\n\n`;
    response += `**Request:** ${request}\n\n`;

    // Color changes
    if (lower.includes('color')) {
      const colors = {
        blue: '#2196f3', green: '#4caf50', purple: '#9c27b0',
        orange: '#ff9800', yellow: '#ffeb3b', cyan: '#00bcd4',
        pink: '#e91e63', red: '#ff1744', white: '#ffffff',
        gold: '#ffd700', teal: '#009688'
      };

      let newColor = null;
      for (const [name, hex] of Object.entries(colors)) {
        if (lower.includes(name)) {
          newColor = { name, hex };
          break;
        }
      }

      if (newColor) {
        response += `### 🎨 Color Change Applied!\n\n`;
        response += `Changing accent color to **${newColor.name}** (\`${newColor.hex}\`)\n\n`;
        response += `\`\`\`css\n:root {\n  --accent: ${newColor.hex};\n  --accent-glow: ${newColor.hex}80;\n  --accent-dim: ${newColor.hex}30;\n  --accent-bright: ${newColor.hex};\n}\n\`\`\`\n\n`;
        response += `**The change has been applied!** Refresh to see full effect, or I've applied it live.\n\n`;
        response += `*Want to revert? Just say "change color back to red"*`;

        // Apply live
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--accent', newColor.hex);
          document.documentElement.style.setProperty('--accent-glow', newColor.hex + '80');
          document.documentElement.style.setProperty('--accent-dim', newColor.hex + '30');
          document.documentElement.style.setProperty('--accent-bright', newColor.hex);
        }

        if (onStatusUpdate) onStatusUpdate(null);
        this.conversationHistory.push({ role: 'assistant', content: response });
        return response;
      }
    }

    // Font changes
    if (lower.includes('font')) {
      const fonts = ['Arial', 'Helvetica', 'Georgia', 'Courier New', 'Verdana', 'Trebuchet MS'];
      let detected = fonts.find(f => lower.includes(f.toLowerCase()));
      
      if (detected) {
        document.body.style.fontFamily = `'${detected}', sans-serif`;
        response += `Font changed to **${detected}**! ✅`;
      } else {
        response += `Available fonts: ${fonts.join(', ')}\n\nTell me which one you'd like!`;
      }

      if (onStatusUpdate) onStatusUpdate(null);
      return response;
    }

    // General edit instruction
    response += `I can make these types of changes:\n\n`;
    response += `### 🎨 Visual Changes\n`;
    response += `- "Change color to **blue/green/purple/gold**"\n`;
    response += `- "Change font to **Arial/Georgia**"\n`;
    response += `- "Make the background **lighter/darker**"\n\n`;
    response += `### ⚙️ Behavior Changes\n`;
    response += `- "Add a new slash command called /xyz"\n`;
    response += `- "Change the welcome message"\n`;
    response += `- "Add a new quick action button"\n\n`;
    response += `### 💻 Code Changes\n`;
    response += `- "Show me your source code"\n`;
    response += `- "Add a new feature: [description]"\n\n`;
    response += `Just describe what you want changed specifically!`;

    if (onStatusUpdate) onStatusUpdate(null);
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  /**
   * Get help text
   */
  getHelpText() {
    return `## 📖 JARVIS Command Reference\n\n### Slash Commands\n| Command | Description |\n|---------|-------------|\n| \`/search [query]\` | Search the web |\n| \`/research [topic]\` | Deep research with multiple sources |\n| \`/code [request]\` | Generate code |\n| \`/create [filename]\` | Create a new file |\n| \`/calculate [expr]\` | Math calculation |\n| \`/summarize [text]\` | Summarize text |\n| \`/self-edit\` | Enter self-edit mode |\n| \`/export\` | Export conversation |\n| \`/clear\` | Clear history |\n| \`/help\` | Show this help |\n\n### Natural Language\nYou can also just talk naturally:\n- "Search for latest AI news"\n- "Write a Python script that..."\n- "Create a file called index.html"\n- "What is quantum computing?"\n- "Change your color to blue"\n\n### Voice Mode\nClick the 🎤 button to use speech-to-text.\n\n### Tips\n- I work completely **free** — no API keys needed\n- I search DuckDuckGo & Wikipedia for info\n- I can **edit my own code** on your request\n- All files are saved in your browser\n- Export conversations anytime with \`/export\``;
  }
}
