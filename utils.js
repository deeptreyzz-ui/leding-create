// ============================================
// SiteForge AI — utils.js
// Utility functions, export, SEO, ZIP creator
// ============================================

const Utils = (() => {
    /**
     * Generate a unique ID
     */
    function uid() {
        return 'sf_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }

    /**
     * Debounce function
     */
    function debounce(fn, delay = 300) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Escape HTML entities
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Show notification
     */
    function notify(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer');
        const el = document.createElement('div');
        el.className = `notification ${type}`;
        el.textContent = message;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(120%)';
            el.style.transition = 'all 0.3s';
            setTimeout(() => el.remove(), 300);
        }, duration);
    }

    /**
     * Generate complete HTML output
     */
    function generateHTML(sections, seo = {}) {
        const seoTitle = seo.title || 'My Landing Page';
        const seoDesc = seo.description || '';
        const seoKeywords = seo.keywords || '';
        const seoOgTitle = seo.ogTitle || seoTitle;
        const favicon = seo.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="%233b82f6"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="white">⚡</text></svg>';

        let sectionsHTML = sections.map(s => renderSectionHTML(s)).join('\n');

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${seoTitle}</title>
            <meta name="description" content="${seoDesc}">
            <meta name="keywords" content="${seoKeywords}">
            <meta property="og:title" content="${seoOgTitle}">
            <meta property="og:description" content="${seoDesc}">
            <meta property="og:type" content="website">
            <link rel="icon" href="${favicon}">
            <style>
                *{margin:0;padding:0;box-sizing:border-box;}
                body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a25;}
                .section{padding:60px 24px;max-width:1100px;margin:0 auto;}
                .section h2{font-size:2rem;margin-bottom:12px;}
                .section h3{font-size:1.3rem;margin-bottom:8px;color:#555;}
                .section p{color:#666;margin-bottom:16px;}
                .section img{max-width:100%;border-radius:12px;margin:16px 0;}
                .btn{display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;border:none;border-radius:8px;text-decoration:none;font-weight:600;cursor:pointer;}
                .btn-outline{background:transparent;border:2px solid #3b82f6;color:#3b82f6;}
                .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;}
                .card{padding:24px;border:1px solid #e5e5e5;border-radius:12px;}
                .flex{display:flex;flex-wrap:wrap;gap:20px;align-items:center;}
                footer{text-align:center;padding:40px;background:#f9f9f9;color:#888;}
            </style>
        </head>
        <body>
            ${sectionsHTML}
        </body>
        </html>`;
    }

    /**
     * Render single section to HTML
     */
    function renderSectionHTML(section) {
        const s = section;
        const title = s.title ? `<h2>${s.title}</h2>` : '';
        const subtitle = s.subtitle ? `<h3>${s.subtitle}</h3>` : '';
        const desc = s.description ? `<p>${s.description}</p>` : '';
        const img = s.image ? `<img src="${s.image}" alt="${s.title || ''}">` : '';
        const btnText = s.buttonText || '';
        const btnLink = s.buttonLink || '#';
        const btn = btnText ? `<a href="${btnLink}" class="btn${s.buttonStyle === 'outline' ? ' btn-outline' : ''}">${btnText}</a>` : '';
        const bgStyle = s.bgColor ? `background-color:${s.bgColor};` : '';
        const textColorStyle = s.textColor ? `color:${s.textColor};` : '';
        const padStyle = s.padding ? `padding:${s.padding}px 24px;` : '';

        let content = '';
        switch (s.type) {
            case 'hero':
                content = `${title}${subtitle}${desc}${btn}${img}`;
                break;
            case 'about':
                content = `<div class="flex">${img}<div>${title}${subtitle}${desc}${btn}</div></div>`;
                break;
            case 'services':
            case 'features':
                content = `${title}${subtitle}<div class="grid">${Array(3).fill('').map((_,i) => `<div class="card"><h4>${s['item'+(i+1)+'Title'] || 'Feature '+(i+1)}</h4><p>${s['item'+(i+1)+'Desc'] || 'Description here.'}</p></div>`).join('')}</div>`;
                break;
            case 'pricing':
                content = `${title}${subtitle}<div class="grid">${Array(3).fill('').map((_,i) => {
                    const plans = ['Basic','Pro','Enterprise'];
                    const prices = ['$9','$29','$99'];
                    return `<div class="card" style="text-align:center;"><h3>${plans[i]}</h3><h2>${prices[i]}</h2><p>per month</p><a href="#" class="btn${i===1?'':' btn-outline'}">Get Started</a></div>`;
                }).join('')}</div>`;
                break;
            case 'gallery':
                content = `${title}${subtitle}<div class="grid">${Array(4).fill('').map(() => `<img src="https://placehold.co/300x200/3b82f6/fff?text=Image" alt="Gallery">`).join('')}</div>`;
                break;
            case 'testimonials':
                content = `${title}${subtitle}<div class="grid">${Array(3).fill('').map(() => `<div class="card"><p>"Amazing service!"</p><strong>- Client Name</strong></div>`).join('')}</div>`;
                break;
            case 'faq':
                content = `${title}${subtitle}${Array(4).fill('').map((_,i) => `<details style="margin-bottom:8px;"><summary>Question ${i+1}?</summary><p>Answer here.</p></details>`).join('')}`;
                break;
            case 'contact':
                content = `${title}${subtitle}<form style="max-width:400px;"><input style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" placeholder="Name"><input style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" placeholder="Email"><textarea style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" rows="3" placeholder="Message"></textarea><button class="btn" style="margin-top:8px;">Send</button></form>`;
                break;
            case 'footer':
                content = `<p>© 2024 ${s.title || 'My Company'}. All rights reserved.</p>`;
                break;
            default:
                content = `${title}${subtitle}${desc}${btn}${img}`;
        }
        return `<section class="section" style="${bgStyle}${textColorStyle}${padStyle}">${content}</section>`;
    }

    /**
     * Generate CSS
     */
    function generateCSS(sections) {
        return `/* Generated by SiteForge AI */
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a25;}
        .section{padding:60px 24px;max-width:1100px;margin:0 auto;}
        .section h2{font-size:2rem;margin-bottom:12px;}
        .section h3{font-size:1.3rem;margin-bottom:8px;color:#555;}
        .section p{color:#666;margin-bottom:16px;}
        .section img{max-width:100%;border-radius:12px;margin:16px 0;}
        .btn{display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;border:none;border-radius:8px;text-decoration:none;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .btn:hover{opacity:0.9;transform:translateY(-1px);}
        .btn-outline{background:transparent;border:2px solid #3b82f6;color:#3b82f6;}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;}
        .card{padding:24px;border:1px solid #e5e5e5;border-radius:12px;transition:box-shadow 0.2s;}
        .card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);}
        .flex{display:flex;flex-wrap:wrap;gap:20px;align-items:center;}
        footer{text-align:center;padding:40px;background:#f9f9f9;color:#888;}
        @media(max-width:768px){.section{padding:40px 16px;}.flex{flex-direction:column;}}
        `;
    }

    /**
     * Generate JS
     */
    function generateJS() {
        return `// Generated by SiteForge AI
        document.addEventListener('DOMContentLoaded',()=>{
            console.log('SiteForge AI — Page Ready');
            document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
        });`;
    }

    /**
     * Create and download a ZIP file (minimal implementation)
     */
    function downloadZIP(sections, seo) {
        const html = generateHTML(sections, seo);
        const css = generateCSS(sections);
        const js = generateJS();
        const robots = 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml';
        const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc></url>\n</urlset>';

        // Create individual blob downloads as a fallback ZIP-like experience
        // For true ZIP: we create a simple bundled download
        const allFiles = [
            { name: 'index.html', content: html },
            { name: 'style.css', content: css },
            { name: 'script.js', content: js },
            { name: 'robots.txt', content: robots },
            { name: 'sitemap.xml', content: sitemap },
        ];

        // Since true ZIP is complex without libraries, we download files individually
        // with a small delay, or create a simple tar-like bundle
        // Better: Create a single HTML file with everything embedded
        const bundledHTML = html.replace('</style>', `
            /* Additional styles */</style>`).replace('</body>', `<script>${js}</script></body>`);

        // Download each file
        allFiles.forEach((file, i) => {
            setTimeout(() => {
                downloadFile(file.name, file.content, 'text/plain');
            }, i * 150);
        });
        notify('Downloading project files...', 'info', 2000);
    }

    /**
     * Download a single file
     */
    function downloadFile(filename, content, mimeType = 'text/html') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Copy text to clipboard
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            notify('Copied to clipboard!', 'success');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            notify('Copied to clipboard!', 'success');
        }
    }

    /**
     * Generate sitemap.xml content
     */
    function generateSitemap(domain = 'https://example.com') {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url><loc>${domain}/</loc><priority>1.0</priority></url>
        </urlset>`;
    }

    /**
     * Generate robots.txt content
     */
    function generateRobots() {
        return 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml';
    }

    return {
        uid,
        debounce,
        escapeHTML,
        notify,
        generateHTML,
        generateCSS,
        generateJS,
        downloadZIP,
        downloadFile,
        copyToClipboard,
        generateSitemap,
        generateRobots,
    };
})();