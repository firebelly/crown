// Global Imports
import appState from './utils/appState';
import searchFilters from './components/searchFilters';
import modalDialog from './components/modalDialog';

// Inits
const currentState = new appState();

const searchPage = new searchFilters();

const filterModal = new modalDialog({
    _hook: 'modal'
});