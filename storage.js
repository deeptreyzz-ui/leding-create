// ============================================
// SiteForge AI — storage.js
// LocalStorage management + Undo/Redo
// ============================================

const Storage = (() => {
    const STORAGE_KEY = 'siteforge_project';
    const HISTORY_KEY = 'siteforge_history';
    const THEME_KEY = 'siteforge_theme';
    const MAX_HISTORY = 50;

    /**
     * Save project to LocalStorage
     */
    function saveProject(sections, seo = {}) {
        const data = { sections, seo, savedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        Utils.notify('Project saved!', 'success', 2000);
    }

    /**
     * Load project from LocalStorage
     */
    function loadProject() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Check if saved project exists
     */
    function hasSavedProject() {
        return !!localStorage.getItem(STORAGE_KEY);
    }

    /**
     * Push state to undo history
     */
    function pushHistory(sections) {
        const history = getHistory();
        history.push(JSON.parse(JSON.stringify(sections)));
        if (history.length > MAX_HISTORY) history.shift();
        // Clear any future states when new action is taken
        const future = getFuture();
        localStorage.setItem(HISTORY_KEY + '_future', JSON.stringify([]));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    /**
     * Get undo history
     */
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Get future (redo) stack
     */
    function getFuture() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY + '_future') || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Undo
     */
    function undo(currentSections) {
        const history = getHistory();
        if (history.length === 0) return null;
        const future = getFuture();
        future.push(JSON.parse(JSON.stringify(currentSections)));
        localStorage.setItem(HISTORY_KEY + '_future', JSON.stringify(future));
        const prev = history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return prev;
    }

    /**
     * Redo
     */
    function redo(currentSections) {
        const future = getFuture();
        if (future.length === 0) return null;
        const history = getHistory();
        history.push(JSON.parse(JSON.stringify(currentSections)));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        const next = future.pop();
        localStorage.setItem(HISTORY_KEY + '_future', JSON.stringify(future));
        return next;
    }

    /**
     * Save theme preference
     */
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Load theme preference
     */
    function loadTheme() {
        return localStorage.getItem(THEME_KEY) || 'dark';
    }

    /**
     * Clear all data
     */
    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem(HISTORY_KEY + '_future');
    }

    return {
        saveProject,
        loadProject,
        hasSavedProject,
        pushHistory,
        undo,
        redo,
        saveTheme,
        loadTheme,
        clearAll,
    };
})();