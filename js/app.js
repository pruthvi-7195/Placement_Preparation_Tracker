document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    
    // Quick script to support mobile menu toggle
    document.addEventListener('click', (e) => {
        const mobileBtn = e.target.closest('.mobile-menu-btn');
        if (mobileBtn) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        }
    });
});

async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    try {
        // Determine the base path depending on whether we are in the root or a subfolder
        // Simple heuristic: if window.location.pathname contains /pages/, we need to go up one level
        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '../' : './';
        
        const response = await fetch(`${basePath}components/sidebar.html`);
        
        if (!response.ok) {
            throw new Error('Failed to load sidebar. Ensure you are running a local server.');
        }
        
        const html = await response.text();
        
        // Fix relative paths in sidebar HTML based on our current location
        let fixedHtml = html;
        if (isSubPage) {
            fixedHtml = html.replace(/href="\.\//g, 'href="../');
        }

        sidebarContainer.innerHTML = fixedHtml;
        
        // Initialize theme logic now that the toggle button exists
        if (typeof initTheme === 'function') {
            initTheme();
        }
        
        setActiveNavLink();
        
    } catch (error) {
        console.error('Error loading sidebar:', error);
        sidebarContainer.innerHTML = `
            <div style="padding: 20px; color: var(--danger);">
                Failed to load sidebar. Please ensure you are running this app via a local web server (e.g., Live Server) rather than opening the file directly in the browser (file:// protocol is restricted by CORS).
            </div>
        `;
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        // Remove existing active classes
        link.classList.remove('active');
        
        // Check if the link href matches the current path
        const linkHref = link.getAttribute('href').replace('../', './');
        
        if (currentPath.endsWith('/') && linkHref === './index.html') {
            link.classList.add('active');
        } else if (currentPath.includes(linkHref.replace('./', ''))) {
            link.classList.add('active');
        }
    });
}
