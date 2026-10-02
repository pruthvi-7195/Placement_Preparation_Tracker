// Simple generic localStorage wrapper
const Store = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    // Initialize default data if not present
    init: () => {
        if (!Store.get('problems')) {
            Store.set('problems', []);
        }
        if (!Store.get('goals')) {
            Store.set('goals', []);
        }
        if (!Store.get('interviews')) {
            Store.set('interviews', []);
        }
    }
};

// Initialize store on load
Store.init();
