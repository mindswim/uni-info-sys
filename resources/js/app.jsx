// Import Bootstrap CSS first, followed by custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/app.css';
import './bootstrap';  // If you have custom JS for Bootstrap, include it here

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// Set the application name from the environment variable or use 'Laravel' as default
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    // Set up the document title for each page
    title: (title) => `${title} - ${appName}`,

    // Resolve and load page components dynamically from the Pages directory
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),

    // Initialize the app and mount it to the root element
    setup({ el, App, props }) {
        const root = createRoot(el);  // Use React 18's createRoot
        root.render(<App {...props} />);  // Render the Inertia App component
    },

    // Set up the Inertia progress bar
    progress: {
        color: '#4B5563',  // Tailwind's Gray-600, adjust as needed
    },
});