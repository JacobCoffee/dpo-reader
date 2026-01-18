/**
 * DPO Reader - Browser version
 * Uses Web Speech API for TTS (Piper WASM integration coming soon)
 */

// Voice assignments (mapped to Web Speech API voices)
const VOICE_NAMES = [
    'Voice A', 'Voice B', 'Voice C', 'Voice D', 'Voice E',
    'Voice F', 'Voice G', 'Voice H', 'Voice I', 'Voice J'
];

// State
let thread = null;
let voiceAssignments = new Map();
let isPlaying = false;
let currentUtterance = null;
let currentPostIndex = 0;
let playbackRate = 1.0;

// DOM elements
const urlInput = document.getElementById('url-input');
const loadBtn = document.getElementById('load-btn');
const status = document.getElementById('status');
const threadInfo = document.getElementById('thread-info');
const threadTitle = document.getElementById('thread-title');
const threadMeta = document.getElementById('thread-meta');
const authorsTable = document.getElementById('authors-table').querySelector('tbody');
const playerSection = document.getElementById('player-section');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const skipBackBtn = document.getElementById('skip-back-btn');
const skipForwardBtn = document.getElementById('skip-forward-btn');
const speedSelect = document.getElementById('speed-select');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const postPreview = document.getElementById('post-preview');
const postCounter = document.getElementById('post-counter');
const narratorText = document.getElementById('narrator-text');
const contentText = document.getElementById('content-text');

// CORS proxy options
const CORS_PROXIES = [
    (url) => url, // Try direct first
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

/**
 * Parse Discourse URL to extract base and topic identifier
 */
function parseDiscourseUrl(url) {
    const parsed = new URL(url);
    const base = `${parsed.protocol}//${parsed.host}`;

    // Try /t/slug/123 format
    let match = parsed.pathname.match(/\/t\/[^/]+\/(\d+)/);
    if (match) return { base, identifier: match[1] };

    // Try /t/slug format
    match = parsed.pathname.match(/\/t\/([^/]+)/);
    if (match) return { base, identifier: match[1] };

    throw new Error('Invalid Discourse URL format');
}

/**
 * Convert HTML to plain text
 */
function htmlToText(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Remove quotes
    doc.querySelectorAll('aside.quote').forEach(el => el.remove());

    // Get text content
    return doc.body.textContent.replace(/\s+/g, ' ').trim();
}

/**
 * Fetch thread with CORS proxy fallback
 */
async function fetchThread(url) {
    const { base, identifier } = parseDiscourseUrl(url);
    const jsonUrl = `${base}/t/${identifier}.json`;

    let lastError;
    for (const proxyFn of CORS_PROXIES) {
        try {
            const proxyUrl = proxyFn(jsonUrl);
            const resp = await fetch(proxyUrl);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (e) {
            lastError = e;
            continue;
        }
    }
    throw lastError;
}

/**
 * Process thread data into our format
 */
function processThread(data, maxPosts = null) {
    const posts = data.post_stream.posts.map(p => ({
        id: p.id,
        number: p.post_number,
        author: p.name || p.username,
        username: p.username,
        content: htmlToText(p.cooked),
        createdAt: p.created_at
    }));

    return {
        id: data.id,
        title: data.title,
        posts: maxPosts ? posts.slice(0, maxPosts) : posts
    };
}

/**
 * Count posts per author
 */
function getAuthorCounts(posts) {
    const counts = {};
    posts.forEach(p => {
        counts[p.username] = (counts[p.username] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

/**
 * Assign voices to authors
 */
function assignVoices(authorCounts) {
    const assignments = new Map();
    const sortedAuthors = Object.keys(authorCounts);

    sortedAuthors.forEach((author, i) => {
        assignments.set(author, i % VOICE_NAMES.length);
    });

    return assignments;
}

/**
 * Get available Web Speech API voices
 */
function getVoices() {
    return new Promise(resolve => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
        } else {
            speechSynthesis.onvoiceschanged = () => {
                resolve(speechSynthesis.getVoices());
            };
        }
    });
}

/**
 * Speak text with a specific voice index
 */
async function speak(text, voiceIndex, onEnd) {
    const voices = await getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = englishVoices[voiceIndex % englishVoices.length] || voices[0];
    utterance.rate = playbackRate;
    utterance.pitch = 0.9 + (voiceIndex * 0.05); // Slight pitch variation

    utterance.onend = onEnd;
    utterance.onerror = onEnd;

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

/**
 * Show status message
 */
function showStatus(message, type = 'loading') {
    status.textContent = message;
    status.className = `status visible ${type}`;
}

/**
 * Hide status
 */
function hideStatus() {
    status.className = 'status';
}

/**
 * Update progress
 */
function updateProgress(current, total, post) {
    const pct = (current / total) * 100;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `Post ${current}/${total}`;
    postCounter.textContent = `Post ${current}/${total}`;

    if (post) {
        narratorText.textContent = `${post.author} says:`;
        contentText.textContent = post.content;
    }

    // Update button states
    updateNavButtons();
}

/**
 * Update navigation button states
 */
function updateNavButtons() {
    if (!thread) return;

    prevBtn.disabled = currentPostIndex <= 0 || isPlaying;
    nextBtn.disabled = currentPostIndex >= thread.posts.length - 1 || isPlaying;
    skipBackBtn.disabled = !isPlaying;
    skipForwardBtn.disabled = !isPlaying;
}

/**
 * Play posts sequentially
 */
async function playPosts() {
    if (!thread || isPlaying) return;

    isPlaying = true;
    playBtn.textContent = '⏸ Pause';
    playBtn.disabled = false;
    stopBtn.disabled = false;
    updateNavButtons();

    for (let i = currentPostIndex; i < thread.posts.length && isPlaying; i++) {
        currentPostIndex = i;
        const post = thread.posts[i];
        const voiceIdx = voiceAssignments.get(post.username) || 0;

        updateProgress(i + 1, thread.posts.length, post);

        const text = `${post.author} says: ${post.content}`;

        await new Promise(resolve => {
            speak(text, voiceIdx, resolve);
        });

        // Small pause between posts
        if (isPlaying) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    isPlaying = false;
    playBtn.textContent = '▶ Play';
    playBtn.disabled = false;
    stopBtn.disabled = true;
    updateNavButtons();

    if (currentPostIndex >= thread.posts.length - 1) {
        currentPostIndex = 0;
        progressText.textContent = 'Completed!';
        postCounter.textContent = 'Completed!';
    }
}

/**
 * Pause playback
 */
function pausePlayback() {
    if (isPlaying) {
        speechSynthesis.pause();
        isPlaying = false;
        playBtn.textContent = '▶ Resume';
        updateNavButtons();
    }
}

/**
 * Resume playback
 */
function resumePlayback() {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        isPlaying = true;
        playBtn.textContent = '⏸ Pause';
        updateNavButtons();
    }
}

/**
 * Toggle play/pause
 */
function togglePlayback() {
    if (!thread) return;

    if (speechSynthesis.paused) {
        resumePlayback();
    } else if (isPlaying) {
        pausePlayback();
    } else {
        playPosts();
    }
}

/**
 * Stop playback
 */
function stopPlayback() {
    isPlaying = false;
    speechSynthesis.cancel();
    playBtn.textContent = '▶ Play';
    playBtn.disabled = false;
    stopBtn.disabled = true;
    updateNavButtons();
}

/**
 * Go to previous post
 */
function prevPost() {
    if (currentPostIndex > 0) {
        speechSynthesis.cancel();
        currentPostIndex--;
        const post = thread.posts[currentPostIndex];
        updateProgress(currentPostIndex + 1, thread.posts.length, post);

        if (isPlaying) {
            isPlaying = false;
            playPosts();
        }
    }
}

/**
 * Go to next post
 */
function nextPost() {
    if (thread && currentPostIndex < thread.posts.length - 1) {
        speechSynthesis.cancel();
        currentPostIndex++;
        const post = thread.posts[currentPostIndex];
        updateProgress(currentPostIndex + 1, thread.posts.length, post);

        if (isPlaying) {
            isPlaying = false;
            playPosts();
        }
    }
}

/**
 * Change playback speed
 */
function changeSpeed(rate) {
    playbackRate = parseFloat(rate);
    // Speed changes take effect on next utterance
}

/**
 * Load thread
 */
async function loadThread() {
    const url = urlInput.value.trim();
    if (!url) return;

    showStatus('Fetching thread...', 'loading');
    loadBtn.disabled = true;

    try {
        const data = await fetchThread(url);
        thread = processThread(data);

        // Assign voices
        const counts = getAuthorCounts(thread.posts);
        voiceAssignments = assignVoices(counts);

        // Update UI
        threadTitle.textContent = thread.title;
        threadMeta.textContent = `${thread.posts.length} posts by ${Object.keys(counts).length} authors`;

        // Populate authors table
        authorsTable.innerHTML = '';
        Object.entries(counts).forEach(([username, count]) => {
            const voiceIdx = voiceAssignments.get(username);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${thread.posts.find(p => p.username === username)?.author || username}</td>
                <td>${count}</td>
                <td><span class="voice-badge">${VOICE_NAMES[voiceIdx]}</span></td>
            `;
            authorsTable.appendChild(row);
        });

        threadInfo.classList.add('visible');
        playerSection.classList.add('visible');
        hideStatus();

        // Reset playback state
        currentPostIndex = 0;
        updateProgress(0, thread.posts.length, null);
        playBtn.disabled = false;

    } catch (e) {
        showStatus(`Error: ${e.message}. Try using the CLI tool instead.`, 'error');
    } finally {
        loadBtn.disabled = false;
    }
}

// Event listeners
loadBtn.addEventListener('click', loadThread);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadThread();
});

playBtn.addEventListener('click', togglePlayback);
stopBtn.addEventListener('click', stopPlayback);
prevBtn.addEventListener('click', prevPost);
nextBtn.addEventListener('click', nextPost);
speedSelect.addEventListener('change', (e) => changeSpeed(e.target.value));

// Skip buttons (note: Web Speech API doesn't support seeking within utterance)
skipBackBtn.addEventListener('click', prevPost);
skipForwardBtn.addEventListener('click', nextPost);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
        case ' ':
            e.preventDefault();
            togglePlayback();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            prevPost();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextPost();
            break;
        case 'ArrowUp':
            e.preventDefault();
            // Speed up
            {
                const options = Array.from(speedSelect.options);
                const currentIdx = options.findIndex(o => o.selected);
                if (currentIdx < options.length - 1) {
                    speedSelect.selectedIndex = currentIdx + 1;
                    changeSpeed(speedSelect.value);
                }
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            // Speed down
            {
                const options = Array.from(speedSelect.options);
                const currentIdx = options.findIndex(o => o.selected);
                if (currentIdx > 0) {
                    speedSelect.selectedIndex = currentIdx - 1;
                    changeSpeed(speedSelect.value);
                }
            }
            break;
    }
});

// Pre-load example URL
urlInput.value = 'https://discuss.python.org/t/c-api-for-querying-whether-the-gil-is-enabled-pyinterpreterstate-isgilenabled/';
