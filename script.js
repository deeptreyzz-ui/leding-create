// ============================================
// SiteForge AI — script.js
// Main application logic
// ============================================

(function() {
    'use strict';

    // ---------- DOM References ----------
    const loader = document.getElementById('loader');
    const landingPage = document.getElementById('landingPage');
    const editorContainer = document.getElementById('editorContainer');
    const startBuildingBtn = document.getElementById('startBuilding');
    const backToLandingBtn = document.getElementById('backToLanding');
    const livePreview = document.getElementById('livePreview');
    const propsPanel = document.getElementById('propsPanel');
    const noSelectionMsg = document.getElementById('noSelectionMsg');
    const componentGrid = document.getElementById('componentGrid');
    const templateGrid = document.getElementById('templateGrid');
    const addSectionBtn = document.getElementById('addSectionBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const saveBtn = document.getElementById('saveBtn');
    const previewBtn = document.getElementById('previewBtn');
    const exportBtn = document.getElementById('exportBtn');
    const toggleThemeLanding = document.getElementById('toggleThemeLanding');
    const toggleThemeEditor = document.getElementById('toggleThemeEditor');
    const exportModal = document.getElementById('exportModal');
    const closeExportModal = document.getElementById('closeExportModal');
    const seoModal = document.getElementById('seoModal');
    const closeSeoModal = document.getElementById('closeSeoModal');
    const fullPreviewModal = document.getElementById('fullPreviewModal');
    const closeFullPreview = document.getElementById('closeFullPreview');
    const fullPreviewFrame = document.getElementById('fullPreviewFrame');
    const dragGhost = document.getElementById('dragGhost');
    const sidebarTabs = document.querySelectorAll('.stab');

    // ---------- State ----------
    let sections = [];
    let selectedSectionId = null;
    let seoData = { title: 'My Landing Page', description: '', keywords: '', ogTitle: '', favicon: '' };
    let currentTheme = 'dark';
    let dragData = null;

    // ---------- Initialize ----------
    function init() {
        // Load theme
        currentTheme = Storage.loadTheme();
        applyTheme(currentTheme);

        // Hide loader after short delay
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 600);

        // Check for saved project
        const saved = Storage.loadProject();
        if (saved && saved.sections && saved.sections.length > 0) {
            sections = saved.sections;
            seoData = saved.seo || seoData;
        }

        // Populate component grid
        renderComponentGrid();
        // Populate template grid
        renderTemplateGrid();
        // Render preview
        renderPreview();

        // Setup event listeners
        setupEventListeners();
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        Storage.saveTheme(theme);
    }

    function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        Utils.notify(`Switched to ${newTheme} theme`, 'info', 2000);
    }

    // ---------- Render Component Grid ----------
    function renderComponentGrid() {
        componentGrid.innerHTML = Components.sectionTypes.map(st => `
            <div class="comp-card" data-type="${st.type}" title="Add ${st.label} section">
                <span class="icon">${st.icon}</span>${st.label}
            </div>
        `).join('');

        // Click handlers
        componentGrid.querySelectorAll('.comp-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                addSection(type);
            });
        });
    }

    // ---------- Render Template Grid ----------
    function renderTemplateGrid() {
        const keys = Templates.getTemplateKeys();
        templateGrid.innerHTML = keys.map(key => {
            const t = Templates.getTemplate(key);
            return `<div class="template-card" data-template="${key}" title="Load ${t.name} template">
                <span class="icon">${t.icon}</span>${t.name}
            </div>`;
        }).join('');

        templateGrid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const key = card.dataset.template;
                loadTemplate(key);
            });
        });
    }

    // ---------- Add Section ----------
    function addSection(type) {
        Storage.pushHistory(sections);
        const newSection = Components.createSection(type);
        if (newSection) {
            sections.push(newSection);
            selectSection(newSection.id);
            renderPreview();
            Utils.notify(`Added ${newSection.label} section`, 'success');
        }
    }

    // ---------- Remove Section ----------
    function removeSection(id) {
        Storage.pushHistory(sections);
        sections = sections.filter(s => s.id !== id);
        if (selectedSectionId === id) {
            selectedSectionId = null;
            hidePropsPanel();
        }
        renderPreview();
        Utils.notify('Section removed', 'info');
    }

    // ---------- Select Section ----------
    function selectSection(id) {
        selectedSectionId = id;
        renderPreview();
        showPropsPanel(id);
    }

    // ---------- Load Template ----------
    function loadTemplate(key) {
        const template = Templates.getTemplate(key);
        if (!template) return;
        Storage.pushHistory(sections);
        sections = JSON.parse(JSON.stringify(template.sections));
        seoData = { ...seoData, ...template.seo };
        selectedSectionId = null;
        hidePropsPanel();
        renderPreview();
        Utils.notify(`Loaded ${template.name} template`, 'success');
    }

    // ---------- Render Live Preview ----------
    function renderPreview() {
        if (sections.length === 0) {
            livePreview.innerHTML = `
                <div style="padding:60px 20px;text-align:center;color:#999;font-family:system-ui;">
                    <h3>Your canvas is empty</h3>
                    <p>Add sections from the left panel or load a template</p>
                </div>`;
            return;
        }
        livePreview.innerHTML = sections.map((s, index) => {
            const isSelected = s.id === selectedSectionId;
            return `<div class="preview-section${isSelected ? ' selected' : ''}" 
                         data-id="${s.id}" 
                         data-index="${index}"
                         draggable="true"
                         style="background-color:${s.bgColor || '#fff'};color:${s.textColor || '#1a1a25'};padding:${s.padding || 60}px 24px;">
                <div class="section-handle" title="Drag to reorder">⠿</div>
                ${renderSectionPreview(s)}
            </div>`;
        }).join('');

        // Attach click handlers
        livePreview.querySelectorAll('.preview-section').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.section-handle')) return;
                selectSection(el.dataset.id);
            });
            // Drag events
            el.addEventListener('dragstart', handleDragStart);
            el.addEventListener('dragover', handleDragOver);
            el.addEventListener('dragleave', handleDragLeave);
            el.addEventListener('drop', handleDrop);
            el.addEventListener('dragend', handleDragEnd);
        });
    }

    function renderSectionPreview(s) {
        const title = s.title ? `<h2 style="font-size:2rem;margin-bottom:8px;">${s.title}</h2>` : '';
        const subtitle = s.subtitle ? `<h3 style="font-size:1.2rem;color:#666;margin-bottom:8px;">${s.subtitle}</h3>` :
            '';
        const desc = s.description ? `<p style="color:#666;margin-bottom:12px;">${s.description}</p>` : '';
        const img = s.image ?
            `<img src="${s.image}" alt="" style="max-width:100%;border-radius:12px;margin:12px 0;">` : '';
        const btn = s.buttonText ?
            `<span style="display:inline-block;padding:10px 24px;background:${s.buttonStyle==='outline'?'transparent':'#3b82f6'};color:${s.buttonStyle==='outline'?'#3b82f6':'#fff'};border:${s.buttonStyle==='outline'?'2px solid #3b82f6':'none'};border-radius:8px;font-weight:600;">${s.buttonText}</span>` :
            '';

        let extra = '';
        if (s.type === 'services' || s.type === 'features') {
            extra = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:16px;">
                ${[1,2,3].map(i => s['item'+i+'Title'] ? `<div style="padding:16px;border:1px solid #e5e5e5;border-radius:8px;"><strong>${s['item'+i+'Title']}</strong><p style="font-size:0.85rem;">${s['item'+i+'Desc']||''}</p></div>` : '').join('')}
            </div>`;
        }
        if (s.type === 'pricing') {
            extra = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:16px;">
                ${['Basic','Pro','Enterprise'].map((p,i) => `<div style="padding:20px;border:1px solid #e5e5e5;border-radius:8px;text-align:center;"><strong>${p}</strong><h3>$${[9,29,99][i]}</h3></div>`).join('')}
            </div>`;
        }
        if (s.type === 'gallery') {
            extra =
                `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:12px;">${Array(4).fill('<div style="background:#e5e5e5;height:120px;border-radius:8px;"></div>').join('')}</div>`;
        }
        if (s.type === 'testimonials') {
            extra =
                `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:12px;">${Array(3).fill('<div style="padding:16px;border:1px solid #e5e5e5;border-radius:8px;"><p style="font-style:italic;">"Great service!"</p><strong>- Client</strong></div>').join('')}</div>`;
        }
        if (s.type === 'faq') {
            extra =
                `<div style="margin-top:12px;">${Array(4).fill('<div style="padding:10px;border-bottom:1px solid #e5e5e5;font-weight:500;">▶ Question?</div>').join('')}</div>`;
        }
        if (s.type === 'contact') {
            extra =
                `<form style="max-width:350px;margin-top:12px;"><input placeholder="Name" style="width:100%;padding:8px;margin-bottom:6px;border:1px solid #ddd;border-radius:4px;"><input placeholder="Email" style="width:100%;padding:8px;margin-bottom:6px;border:1px solid #ddd;border-radius:4px;"><textarea rows="2" placeholder="Message" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;"></textarea></form>`;
        }
        if (s.type === 'footer') {
            return `<p style="text-align:center;">© 2024 ${s.title||'Company'}. ${s.description||'All rights reserved.'}</p>`;
        }

        return `${title}${subtitle}${desc}${btn}${img}${extra}`;
    }

    // ---------- Properties Panel ----------
    function showPropsPanel(id) {
        const section = sections.find(s => s.id === id);
        if (!section) return hidePropsPanel();
        noSelectionMsg.style.display = 'none';
        propsPanel.style.display = 'flex';

        const fields = [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'subtitle', label: 'Subtitle', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'buttonText', label: 'Button Text', type: 'text' },
            { key: 'buttonLink', label: 'Button Link', type: 'text' },
            { key: 'buttonStyle', label: 'Button Style', type: 'select', options: ['solid', 'outline'] },
            { key: 'image', label: 'Image URL', type: 'text' },
            { key: 'bgColor', label: 'Background', type: 'color' },
            { key: 'textColor', label: 'Text Color', type: 'color' },
            { key: 'padding', label: 'Padding (px)', type: 'number' },
        ];

        // Add service/feature item fields
        if (section.type === 'services' || section.type === 'features') {
            for (let i = 1; i <= 3; i++) {
                fields.push({ key: 'item' + i + 'Title', label: `Item ${i} Title`, type: 'text' });
                fields.push({ key: 'item' + i + 'Desc', label: `Item ${i} Description`, type: 'text' });
            }
        }

        propsPanel.innerHTML = fields.map(f => {
            if (f.type === 'select') {
                return `<label>${f.label}
                    <select data-key="${f.key}">
                        ${f.options.map(o => `<option value="${o}" ${section[f.key]===o?'selected':''}>${o}</option>`).join('')}
                    </select>
                </label>`;
            }
            if (f.type === 'color') {
                return `<label>${f.label}
                    <div class="color-row">
                        <input type="color" data-key="${f.key}" value="${section[f.key] || '#ffffff'}">
                        <span>${section[f.key] || '#ffffff'}</span>
                    </div>
                </label>`;
            }
            if (f.type === 'textarea') {
                return `<label>${f.label}
                    <textarea data-key="${f.key}" rows="2">${section[f.key] || ''}</textarea>
                </label>`;
            }
            return `<label>${f.label}
                <input type="${f.type}" data-key="${f.key}" value="${section[f.key] || ''}">
            </label>`;
        }).join('') + `
            <button class="btn-danger" id="deleteSectionBtn">🗑 Delete Section</button>
            <button class="btn-ghost" id="duplicateSectionBtn">📋 Duplicate</button>
        `;

        // Attach input listeners
        const debouncedUpdate = Utils.debounce(() => {
            Storage.pushHistory(sections);
            updateSectionFromPanel(id);
        }, 400);

        propsPanel.querySelectorAll('input, textarea, select').forEach(el => {
            el.addEventListener('input', debouncedUpdate);
            el.addEventListener('change', () => {
                Storage.pushHistory(sections);
                updateSectionFromPanel(id);
            });
        });

        // Delete button
        document.getElementById('deleteSectionBtn')?.addEventListener('click', () => removeSection(id));
        // Duplicate button
        document.getElementById('duplicateSectionBtn')?.addEventListener('click', () => {
            Storage.pushHistory(sections);
            const original = sections.find(s => s.id === id);
            if (original) {
                const clone = JSON.parse(JSON.stringify(original));
                clone.id = Utils.uid();
                const idx = sections.findIndex(s => s.id === id);
                sections.splice(idx + 1, 0, clone);
                selectSection(clone.id);
                renderPreview();
                Utils.notify('Section duplicated', 'success');
            }
        });
    }

    function updateSectionFromPanel(id) {
        const section = sections.find(s => s.id === id);
        if (!section) return;
        propsPanel.querySelectorAll('[data-key]').forEach(el => {
            const key = el.dataset.key;
            if (el.type === 'number') section[key] = parseInt(el.value) || 60;
            else section[key] = el.value;
        });
        renderPreview();
    }

    function hidePropsPanel() {
        noSelectionMsg.style.display = 'block';
        propsPanel.style.display = 'none';
        propsPanel.innerHTML = '';
    }

    // ---------- Drag & Drop ----------
    function handleDragStart(e) {
        const el = e.currentTarget;
        const index = parseInt(el.dataset.index);
        dragData = { fromIndex: index, id: el.dataset.id };
        el.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        // Set drag ghost
        if (dragGhost) {
            dragGhost.style.display = 'block';
            dragGhost.textContent = 'Move Section';
            e.dataTransfer.setDragImage(dragGhost, 0, 0);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (!dragData) return;
        const toIndex = parseInt(e.currentTarget.dataset.index);
        if (dragData.fromIndex === toIndex) return;
        Storage.pushHistory(sections);
        const [moved] = sections.splice(dragData.fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        renderPreview();
        Utils.notify('Section moved', 'info');
    }

    function handleDragEnd(e) {
        e.currentTarget.style.opacity = '1';
        livePreview.querySelectorAll('.preview-section').forEach(el => el.classList.remove('drag-over'));
        dragData = null;
        if (dragGhost) dragGhost.style.display = 'none';
    }

    // ---------- Export Functions ----------
    function exportHTML() {
        const html = Utils.generateHTML(sections, seoData);
        Utils.downloadFile('index.html', html, 'text/html');
        Utils.notify('HTML downloaded!', 'success');
    }

    function exportCSS() {
        const css = Utils.generateCSS(sections);
        Utils.downloadFile('style.css', css, 'text/css');
        Utils.notify('CSS downloaded!', 'success');
    }

    function exportJS() {
        const js = Utils.generateJS();
        Utils.downloadFile('script.js', js, 'text/javascript');
        Utils.notify('JS downloaded!', 'success');
    }

    function exportZIP() {
        Utils.downloadZIP(sections, seoData);
    }

    function copyHTML() {
        const html = Utils.generateHTML(sections, seoData);
        Utils.copyToClipboard(html);
    }

    function openFullPreview() {
        const html = Utils.generateHTML(sections, seoData);
        fullPreviewFrame.innerHTML = html;
        fullPreviewModal.style.display = 'flex';
    }

    // ---------- SEO Modal ----------
    function openSEOModal() {
        document.getElementById('seoTitle').value = seoData.title || '';
        document.getElementById('seoDesc').value = seoData.description || '';
        document.getElementById('seoKeywords').value = seoData.keywords || '';
        document.getElementById('seoOgTitle').value = seoData.ogTitle || '';
        seoModal.style.display = 'flex';
    }

    function applySEO() {
        seoData.title = document.getElementById('seoTitle').value;
        seoData.description = document.getElementById('seoDesc').value;
        seoData.keywords = document.getElementById('seoKeywords').value;
        seoData.ogTitle = document.getElementById('seoOgTitle').value;
        seoModal.style.display = 'none';
        Utils.notify('SEO settings applied!', 'success');
    }

    // ---------- Event Listeners ----------
    function setupEventListeners() {
        // Start Building
        startBuildingBtn.addEventListener('click', () => {
            landingPage.style.display = 'none';
            editorContainer.style.display = 'flex';
            if (sections.length === 0) {
                // Load default template
                loadTemplate('agency');
            }
            renderPreview();
        });

        // Back to Landing
        backToLandingBtn.addEventListener('click', () => {
            editorContainer.style.display = 'none';
            landingPage.style.display = 'flex';
            selectedSectionId = null;
            hidePropsPanel();
        });

        // Add Section button
        addSectionBtn.addEventListener('click', () => {
            // Show a quick prompt or add hero by default
            const type = prompt(
                'Section type:\n' + Components.sectionTypes.map(s => s.type + ' - ' + s.label).join('\n'),
                'hero');
            if (type && Components.sectionTypes.find(s => s.type === type)) {
                addSection(type);
            } else if (type) {
                Utils.notify('Invalid section type. Try: hero, about, services, etc.', 'error');
            }
        });

        // Undo / Redo
        undoBtn.addEventListener('click', () => {
            const prev = Storage.undo(sections);
            if (prev) {
                sections = prev;
                selectedSectionId = null;
                hidePropsPanel();
                renderPreview();
                Utils.notify('Undo', 'info', 1500);
            } else {
                Utils.notify('Nothing to undo', 'info', 1500);
            }
        });
        redoBtn.addEventListener('click', () => {
            const next = Storage.redo(sections);
            if (next) {
                sections = next;
                selectedSectionId = null;
                hidePropsPanel();
                renderPreview();
                Utils.notify('Redo', 'info', 1500);
            } else {
                Utils.notify('Nothing to redo', 'info', 1500);
            }
        });

        // Save
        saveBtn.addEventListener('click', () => {
            Storage.saveProject(sections, seoData);
        });

        // Preview
        previewBtn.addEventListener('click', openFullPreview);
        closeFullPreview.addEventListener('click', () => {
            fullPreviewModal.style.display = 'none';
            fullPreviewFrame.innerHTML = '';
        });
        fullPreviewModal.addEventListener('click', (e) => {
            if (e.target === fullPreviewModal) {
                fullPreviewModal.style.display = 'none';
                fullPreviewFrame.innerHTML = '';
            }
        });

        // Export
        exportBtn.addEventListener('click', () => { exportModal.style.display = 'flex'; });
        closeExportModal.addEventListener('click', () => { exportModal.style.display = 'none'; });
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) exportModal.style.display = 'none';
        });
        exportModal.querySelectorAll('.btn-export').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.export;
                switch (action) {
                    case 'html':
                        exportHTML();
                        break;
                    case 'css':
                        exportCSS();
                        break;
                    case 'js':
                        exportJS();
                        break;
                    case 'zip':
                        exportZIP();
                        break;
                    case 'copy':
                        copyHTML();
                        break;
                    case 'seo':
                        exportModal.style.display = 'none';
                        openSEOModal();
                        break;
                }
            });
        });

        // SEO Modal
        closeSeoModal.addEventListener('click', () => { seoModal.style.display = 'none'; });
        seoModal.addEventListener('click', (e) => {
            if (e.target === seoModal) seoModal.style.display = 'none';
        });
        document.getElementById('applySeo').addEventListener('click', applySEO);

        // Theme toggles
        toggleThemeLanding.addEventListener('click', toggleTheme);
        toggleThemeEditor.addEventListener('click', toggleTheme);

        // Sidebar tabs
        sidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                sidebarTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove(
                    'active'));
                document.getElementById('tab-' + target).classList.add('active');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoBtn.click();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redoBtn.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                Storage.saveProject(sections, seoData);
            }
        });

        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                exportModal.style.display = 'none';
                seoModal.style.display = 'none';
                fullPreviewModal.style.display = 'none';
                fullPreviewFrame.innerHTML = '';
            }
        });
    }

    // ---------- Start App ----------
    init();
})();