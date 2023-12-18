// Global Imports
import appState from './utils/appState';
import searchFilters from './components/searchFilters';
import modalDialog from './components/modalDialog';

// Inits
const currentState = new appState();

const searchPage = new searchFilters();

// const programModal = new modalDialog({
//     _id: 'programModal'
// });

// const studentModal = new modalDialog({
//     _id: 'studentModal'
// });

// const instructorModal = new modalDialog({
//     _id: 'instructorModal'
// });

const filterModal = new modalDialog({
    _hook: 'modal'
});