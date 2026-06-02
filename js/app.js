/* ============================================
   JARVIS - Main Application Controller
   Free AI Assistant - No API Keys Required
   ============================================ */

const JARVIS = {
  brain: null,
  speech: null,
  fileSystem: new Map(),
  currentMode: 'chat', // 'chat' or 'voice'
  conversations: [],
  currentConversation: null,
  isProcessing: false,

  /**
   * Initialize JARVIS
   */
  init() {
    this.brain = new JarvisBrain();
    this.speech = new SpeechEngine();
    this.setupSpeechCallbacks();
    this.setupEventListeners();
    this.loadState();
    this.createNewConversation();
    this.updateUI();

    console.log('%c🔴 JARVIS Online', 'color: #ff1744; font-size: 20px; font-weight: bold;');
    console.log('%cFree AI Assistant - No API Keys Required', 'color: #a0a0b0; font-size: 12px;');
  },

  /**
   * Setup speech callbacks
   */
  setupSpeechCallbacks() {
    this.speech.onResult = (text) => {
      const textarea = document.getElementById('messageInput');
      textarea.value = text;
      this.hideVoiceOverlay();
      this.sendMessage();
    };

    this.speech.onInterim = (text) => {
      const voiceText = document.getElementById('voiceText');
      if (voiceText) voiceText.textContent = text || 'Listening...';
      
      const textarea = document.getElementById('messageInput');
      textarea.value = text;
    };

    this.speech.onStart = () => {
      const micBtn = document.getElementById('micBtn');
      if (micBtn) micBtn.classList.add('recording');
    };

    this.speech.onEnd = () => {
      const micBtn = document.getElementById('micBtn');
      if (micBtn) micBtn.classList.remove('recording');
    };

    this.speech.onError = (error) => {
      const micBtn = document.getElementById('micBtn');
      if (micBtn) micBtn.classList.remove('recording');
      this.hideVoiceOverlay();
      
      if (error === 'not-allowed') {
        this.showNotification('🎤 Microphone access denied. Please allow microphone in browser settings.', 'error');
      } else {
        this.showNotification(`🎤 Speech error: ${error}`, 'error');
      }
    };
  },

  /**
   * Setup DOM event listeners
   */
  setupEventListeners() {
    // Send message
    const textarea = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    textarea.addEventListener('input', () => {
      // Auto-resize
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
      // Toggle send button
      sendBtn.disabled = textarea.value.trim().length === 0;
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    // Mic button
    document.getElementById('micBtn').addEventListener('click', () => {
      if (this.currentMode === 'voice') {
        this.showVoiceOverlay();
      }
      this.speech.toggle();
    });

    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // New chat
    document.getElementById('newChatBtn').addEventListener('click', () => {
      this.createNewConversation();
    });

    // Mode toggles
    document.getElementById('chatModeBtn').addEventListener('click', () => this.setMode('chat'));
    document.getElementById('voiceModeBtn').addEventListener('click', () => this.setMode('voice'));

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.toggle('active');
    });

    document.getElementById('settingsClose').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.remove('active');
    });

    // Settings modal backdrop click
    document.getElementById('settingsModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('settingsModal')) {
        document.getElementById('settingsModal').classList.remove('active');
      }
    });

    // File panel
    document.getElementById('fileBtn').addEventListener('click', () => {
      document.getElementById('filePanel').classList.toggle('active');
      this.updateFilePanel();
    });

    document.getElementById('filePanelClose').addEventListener('click', () => {
      document.getElementById('filePanel').classList.remove('active');
    });

    // Voice overlay close
    document.getElementById('voiceCloseBtn').addEventListener('click', () => {
      this.speech.stop();
      this.hideVoiceOverlay();
    });

    // Quick actions
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        if (prompt) {
          document.getElementById('messageInput').value = prompt;
          this.sendMessage();
        }
      });
    });

    // Settings save
    document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());

    // Apply saved settings
    this.loadSettings();
  },

  /**
   * Set mode (chat/voice)
   */
  setMode(mode) {
    this.currentMode = mode;
    document.getElementById('chatModeBtn').classList.toggle('active', mode === 'chat');
    document.getElementById('voiceModeBtn').classList.toggle('active', mode === 'voice');

    if (mode === 'voice') {
      document.getElementById('messageInput').placeholder = 'Click 🎤 or type here...';
    } else {
      document.getElementById('messageInput').placeholder = 'Message JARVIS...';
    }
  },

  /**
   * Send message
   */
  async sendMessage() {
    const textarea = document.getElementById('messageInput');
    const message = textarea.value.trim();
    if (!message || this.isProcessing) return;

    // Clear input
    textarea.value = '';
    textarea.style.height = 'auto';
    document.getElementById('sendBtn').disabled = true;

    // Hide welcome screen
    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.style.display = 'none';

    // Add user message
    this.addMessageToUI('user', message);
    this.saveMessageToConversation('user', message);

    // Show typing indicator
    this.isProcessing = true;
    const typingId = this.showTypingIndicator();

    // Process with brain
    try {
      const response = await this.brain.processMessage(message, (status) => {
        this.updateStatus(status);
      });

      // Remove typing indicator
      this.removeTypingIndicator(typingId);

      // Add AI response
      this.addMessageToUI('ai', response);
      this.saveMessageToConversation('ai', response);

      // Speak response in voice mode
      if (this.currentMode === 'voice') {
        this.speech.speak(response);
      }

      // Update conversation title
      this.updateConversationTitle(message);

    } catch (error) {
      this.removeTypingIndicator(typingId);
      this.addMessageToUI('ai', `⚠️ Error: ${error.message}\n\nPlease try again.`);
    }

    this.isProcessing = false;
    this.updateStatus(null);
    this.scrollToBottom();
  },

  /**
   * Add message to chat UI
   */
  addMessageToUI(role, content) {
    const chatArea = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = `message ${role}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatarContent = role === 'ai' ? 'J' : '👤';
    const parsedContent = role === 'ai' ? MarkdownParser.parse(content) : this.escapeHtml(content);

    div.innerHTML = `
      <div class="message-avatar">${avatarContent}</div>
      <div class="message-content">
        <div class="message-bubble">${parsedContent}</div>
        <div class="message-meta">
          <span>${time}</span>
          <div class="message-actions">
            <button onclick="JARVIS.copyMessage(this)" title="Copy">📋</button>
            ${role === 'ai' ? `<button onclick="JARVIS.speech.speak(\`${content.replace(/`/g, "'").substring(0, 500)}\`)" title="Read aloud">🔊</button>` : ''}
          </div>
        </div>
      </div>
    `;

    chatArea.appendChild(div);
    this.scrollToBottom();
  },

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const chatArea = document.getElementById('chatArea');
    const div = document.createElement('div');
    const id = 'typing-' + Date.now();
    div.id = id;
    div.className = 'message ai';
    div.innerHTML = `
      <div class="message-avatar">J</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    chatArea.appendChild(div);
    this.scrollToBottom();

    // Also animate the orb
    const orb = document.querySelector('.orb-container');
    if (orb) orb.classList.add('orb-responding');

    return id;
  },

  /**
   * Remove typing indicator
   */
  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();

    const orb = document.querySelector('.orb-container');
    if (orb) orb.classList.remove('orb-responding');
  },

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    const chatArea = document.getElementById('chatArea');
    setTimeout(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 50);
  },

  /**
   * Update status bar
   */
  updateStatus(text) {
    const statusBar = document.getElementById('statusBar');
    const statusText = document.getElementById('statusText');
    if (text) {
      statusText.textContent = text;
      statusBar.classList.add('active');
    } else {
      statusBar.classList.remove('active');
    }
  },

  /**
   * Voice overlay
   */
  showVoiceOverlay() {
    document.getElementById('voiceOverlay').classList.add('active');
    document.getElementById('voiceText').textContent = 'Listening...';
  },

  hideVoiceOverlay() {
    document.getElementById('voiceOverlay').classList.remove('active');
  },

  /**
   * Show notification
   */
  showNotification(text, type = 'info') {
    const statusBar = document.getElementById('statusBar');
    const statusText = document.getElementById('statusText');
    statusText.textContent = text;
    statusBar.classList.add('active');
    setTimeout(() => statusBar.classList.remove('active'), 4000);
  },

  /**
   * Copy message content
   */
  copyMessage(btn) {
    const bubble = btn.closest('.message-content').querySelector('.message-bubble');
    const text = bubble.textContent || bubble.innerText;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✅';
      setTimeout(() => btn.textContent = '📋', 1500);
    });
  },

  /**
   * Copy code block
   */
  copyCode(btn) {
    const code = btn.parentElement.querySelector('code');
    navigator.clipboard.writeText(code.textContent).then(() => {
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy', 1500);
    });
  },

  /**
   * Conversation Management
   */
  createNewConversation() {
    const conv = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
      created: new Date().toISOString()
    };
    this.conversations.unshift(conv);
    this.currentConversation = conv;
    this.brain.conversationHistory = [];

    // Clear chat area
    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML = '';

    // Show welcome screen
    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.style.display = 'flex';
    chatArea.appendChild(welcome);

    this.updateChatHistory();
    this.saveState();
  },

  saveMessageToConversation(role, content) {
    if (this.currentConversation) {
      this.currentConversation.messages.push({ role, content, time: new Date().toISOString() });
      this.saveState();
    }
  },

  updateConversationTitle(firstMessage) {
    if (this.currentConversation && this.currentConversation.title === 'New Chat') {
      this.currentConversation.title = firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
      this.updateChatHistory();
      this.saveState();
    }
  },

  loadConversation(convId) {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) return;

    this.currentConversation = conv;
    this.brain.conversationHistory = conv.messages.map(m => ({ role: m.role, content: m.content }));

    // Rebuild chat area
    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML = '';

    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.style.display = 'none';

    for (const msg of conv.messages) {
      this.addMessageToUI(msg.role, msg.content);
    }

    this.updateChatHistory();
  },

  updateChatHistory() {
    const list = document.getElementById('chatHistoryList');
    list.innerHTML = '';

    this.conversations.forEach(conv => {
      const div = document.createElement('div');
      div.className = `chat-history-item${conv.id === this.currentConversation?.id ? ' active' : ''}`;
      div.textContent = conv.title;
      div.addEventListener('click', () => this.loadConversation(conv.id));
      list.appendChild(div);
    });
  },

  /**
   * File Panel
   */
  updateFilePanel() {
    const list = document.getElementById('fileList');
    list.innerHTML = '';

    if (this.fileSystem.size === 0) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">No files yet.<br>Ask JARVIS to create files!</div>';
      return;
    }

    this.fileSystem.forEach((file, name) => {
      const div = document.createElement('div');
      div.className = 'file-item';
      const ext = name.split('.').pop();
      const icons = { html: '🌐', css: '🎨', js: '📜', py: '🐍', json: '📦', md: '📝', txt: '📄', sql: '🗄️' };
      const icon = icons[ext] || '📄';
      const size = file.size > 1024 ? `${(file.size / 1024).toFixed(1)}KB` : `${file.size}B`;

      div.innerHTML = `
        <span class="file-item-icon">${icon}</span>
        <span class="file-item-name">${name}</span>
        <span class="file-item-size">${size}</span>
      `;
      div.addEventListener('click', () => this.downloadFile(name));
      list.appendChild(div);
    });
  },

  /**
   * Download file
   */
  downloadFile(filename) {
    const file = this.fileSystem.get(filename);
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification(`📥 Downloaded: ${filename}`);
  },

  /**
   * Settings
   */
  saveSettings() {
    const settings = {
      userName: document.getElementById('settingName').value,
      language: document.getElementById('settingLanguage').value,
      voiceEnabled: document.getElementById('settingVoice').checked,
      systemPrompt: document.getElementById('settingPrompt').value,
    };

    localStorage.setItem('jarvis_settings', JSON.stringify(settings));

    if (settings.language) {
      this.speech.setLanguage(settings.language);
    }

    if (settings.systemPrompt) {
      this.brain.systemPrompt = settings.systemPrompt;
    }

    document.getElementById('settingsModal').classList.remove('active');
    this.showNotification('⚙️ Settings saved!');
  },

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('jarvis_settings') || '{}');
      if (settings.userName) document.getElementById('settingName').value = settings.userName;
      if (settings.language) {
        document.getElementById('settingLanguage').value = settings.language;
        this.speech.setLanguage(settings.language);
      }
      if (settings.voiceEnabled !== undefined) document.getElementById('settingVoice').checked = settings.voiceEnabled;
      if (settings.systemPrompt) {
        document.getElementById('settingPrompt').value = settings.systemPrompt;
        this.brain.systemPrompt = settings.systemPrompt;
      }
    } catch (e) {}
  },

  /**
   * State persistence
   */
  saveState() {
    try {
      const state = {
        conversations: this.conversations.slice(0, 20), // Keep last 20
        currentId: this.currentConversation?.id
      };
      localStorage.setItem('jarvis_state', JSON.stringify(state));
    } catch (e) {}
  },

  loadState() {
    try {
      const state = JSON.parse(localStorage.getItem('jarvis_state') || '{}');
      if (state.conversations) {
        this.conversations = state.conversations;
      }
    } catch (e) {}
  },

  /**
   * UI Helpers
   */
  updateUI() {
    this.updateChatHistory();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  JARVIS.init();
});
