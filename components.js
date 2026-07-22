// ============================================
// SiteForge AI — components.js
// Component library definitions
// ============================================

const Components = (() => {
    /**
     * All available section types with default properties
     */
    const sectionTypes = [
        { type: 'hero', label: 'Hero', icon: '🚀', defaults: { title: 'Welcome to Our Site',
                subtitle: 'We build amazing things',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                buttonText: 'Get Started', buttonLink: '#', buttonStyle: 'solid', bgColor: '#f8fafc',
                textColor: '#1a1a25', padding: 80, image: '' } },
        { type: 'about', label: 'About', icon: 'ℹ️', defaults: { title: 'About Us',
                subtitle: 'Our Story',
                description: 'We are a passionate team dedicated to delivering excellence.',
                buttonText: 'Learn More', buttonLink: '#', buttonStyle: 'outline', bgColor: '#ffffff',
                textColor: '#1a1a25', padding: 60, image: 'https://placehold.co/400x300/3b82f6/fff?text=About' } },
        { type: 'services', label: 'Services', icon: '🛠️', defaults: { title: 'Our Services',
                subtitle: 'What we offer', description: '', bgColor: '#f1f5f9', textColor: '#1a1a25', padding: 60,
                item1Title: 'Web Design', item1Desc: 'Beautiful designs.',
                item2Title: 'Development', item2Desc: 'Clean code.',
                item3Title: 'SEO', item3Desc: 'Top rankings.' } },
        { type: 'features', label: 'Features', icon: '⭐', defaults: { title: 'Key Features',
                subtitle: 'Why choose us', description: '', bgColor: '#ffffff', textColor: '#1a1a25', padding: 60,
                item1Title: 'Fast', item1Desc: 'Lightning speed.',
                item2Title: 'Secure', item2Desc: 'Bank-level security.',
                item3Title: 'Scalable', item3Desc: 'Grows with you.' } },
        { type: 'pricing', label: 'Pricing', icon: '💲', defaults: { title: 'Pricing Plans',
                subtitle: 'Choose your plan', description: '', bgColor: '#f8fafc', textColor: '#1a1a25', padding: 60 } },
        { type: 'gallery', label: 'Gallery', icon: '🖼️', defaults: { title: 'Our Gallery',
                subtitle: 'Recent work', description: '', bgColor: '#ffffff', textColor: '#1a1a25', padding: 60 } },
        { type: 'testimonials', label: 'Testimonials', icon: '💬', defaults: { title: 'Testimonials',
                subtitle: 'What clients say', description: '', bgColor: '#f1f5f9', textColor: '#1a1a25',
            padding: 60 } },
        { type: 'faq', label: 'FAQ', icon: '❓', defaults: { title: 'FAQ', subtitle: 'Frequent questions',
                description: '', bgColor: '#ffffff', textColor: '#1a1a25', padding: 60 } },
        { type: 'contact', label: 'Contact', icon: '📧', defaults: { title: 'Contact Us',
                subtitle: 'Get in touch', description: '', bgColor: '#f8fafc', textColor: '#1a1a25',
            padding: 60 } },
        { type: 'footer', label: 'Footer', icon: '📄', defaults: { title: 'My Company',
                description: '© 2024 All rights reserved.', bgColor: '#1e293b', textColor: '#ffffff',
            padding: 40 } },
    ];

    /**
     * UI Component library (for inserting into sections)
     */
    const uiComponents = [
        { type: 'button-solid', label: 'Solid Button', icon: '🔘', html: '<a href="#" class="btn">Click Me</a>' },
        { type: 'button-outline', label: 'Outline Button', icon: '⭕',
            html: '<a href="#" class="btn btn-outline">Click Me</a>' },
        { type: 'card', label: 'Card', icon: '🃏',
            html: '<div class="card"><h4>Card Title</h4><p>Card description goes here.</p></div>' },
        { type: 'form-simple', label: 'Form', icon: '📝',
            html: '<form><input placeholder="Email" style="padding:10px;width:100%;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;"><button class="btn">Submit</button></form>' },
        { type: 'timer', label: 'Countdown', icon: '⏱️',
            html: '<div class="countdown" style="font-size:2rem;font-weight:700;text-align:center;">00:00:00</div>' },
        { type: 'slider', label: 'Slider', icon: '🎠',
            html: '<div style="overflow:hidden;border-radius:12px;"><img src="https://placehold.co/600x300/3b82f6/fff?text=Slide" style="width:100%;"></div>' },
        { type: 'menu', label: 'Menu', icon: '📋',
            html: '<nav style="display:flex;gap:20px;justify-content:center;padding:16px;"><a href="#" style="color:#3b82f6;">Home</a><a href="#" style="color:#333;">About</a><a href="#" style="color:#333;">Contact</a></nav>' },
    ];

    /**
     * Create default section object
     */
    function createSection(type) {
        const def = sectionTypes.find(s => s.type === type);
        if (!def) return null;
        return {
            id: Utils.uid(),
            type: def.type,
            label: def.label,
            ...JSON.parse(JSON.stringify(def.defaults)),
        };
    }

    return {
        sectionTypes,
        uiComponents,
        createSection,
    };
})();