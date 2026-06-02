/* ============================================
   JARVIS - Free Web Search Engine
   Uses multiple free search APIs with fallbacks
   NO API KEY REQUIRED
   ============================================ */

class WebSearch {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 min cache
  }

  /**
   * Main search method with multiple fallback engines
   */
  async search(query, numResults = 5) {
    const cacheKey = query.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < this.cacheExpiry) {
        return cached.results;
      }
    }

    const engines = [
      () => this.searchDuckDuckGo(query, numResults),
      () => this.searchWikipedia(query, numResults),
      () => this.searchSearX(query, numResults),
    ];

    for (const engine of engines) {
      try {
        const results = await engine();
        if (results && results.length > 0) {
          this.cache.set(cacheKey, { results, time: Date.now() });
          return results;
        }
      } catch (e) {
        console.warn('Search engine failed, trying next...', e);
      }
    }

    return [];
  }

  /**
   * DuckDuckGo Instant Answer API (free, no key)
   */
  async searchDuckDuckGo(query, numResults) {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url);
    const data = await response.json();
    const results = [];

    if (data.Abstract) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || '',
        snippet: data.Abstract,
        source: 'DuckDuckGo'
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, numResults - results.length)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.substring(0, 80),
            url: topic.FirstURL || '',
            snippet: topic.Text,
            source: 'DuckDuckGo'
          });
        }
        // Handle subtopics
        if (topic.Topics) {
          for (const sub of topic.Topics.slice(0, 2)) {
            if (sub.Text) {
              results.push({
                title: sub.Text.substring(0, 80),
                url: sub.FirstURL || '',
                snippet: sub.Text,
                source: 'DuckDuckGo'
              });
            }
          }
        }
      }
    }

    // Also check Answer field
    if (data.Answer) {
      results.unshift({
        title: `Answer: ${query}`,
        url: '',
        snippet: data.Answer,
        source: 'DuckDuckGo Instant'
      });
    }

    return results.slice(0, numResults);
  }

  /**
   * Wikipedia API (free, no key)
   */
  async searchWikipedia(query, numResults) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.extract) {
          return [{
            title: data.title,
            url: data.content_urls?.desktop?.page || '',
            snippet: data.extract,
            source: 'Wikipedia'
          }];
        }
      }
    } catch (e) {}

    // Fallback to Wikipedia search
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${numResults}&format=json&origin=*`;
    const resp = await fetch(searchUrl);
    const data = await resp.json();
    
    if (data.query?.search) {
      return data.query.search.map(item => ({
        title: item.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: item.snippet.replace(/<[^>]*>/g, ''),
        source: 'Wikipedia'
      }));
    }

    return [];
  }

  /**
   * SearX public instances (free, no key)
   */
  async searchSearX(query, numResults) {
    const instances = [
      'https://searx.be',
      'https://search.bus-hit.me',
      'https://searx.tiekoetter.com'
    ];

    for (const instance of instances) {
      try {
        const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&categories=general`;
        const response = await fetch(url, { 
          signal: AbortSignal.timeout(5000),
          headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        if (data.results) {
          return data.results.slice(0, numResults).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.content || '',
            source: 'SearX'
          }));
        }
      } catch (e) {
        continue;
      }
    }

    return [];
  }

  /**
   * Fetch a page's text content (for research)
   */
  async fetchPage(url) {
    try {
      // Use allorigins proxy to bypass CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      const data = await response.json();
      
      if (data.contents) {
        // Extract text from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Remove scripts, styles, nav, footer
        doc.querySelectorAll('script, style, nav, footer, header, aside, .ad, .advertisement').forEach(el => el.remove());
        
        let text = doc.body?.textContent || '';
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();
        // Limit to reasonable length
        return text.substring(0, 5000);
      }
    } catch (e) {
      console.warn('Failed to fetch page:', e);
    }
    return null;
  }
}
