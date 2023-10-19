// searchFilters
const nunjucks = require('nunjucks');
import programObj from '../../_data/organizationList.json';
import studentObj from '../../_data/studentList.json';
import translatorObj from '../../_data/dataTranslator.json';

class searchFilters {

    constructor(options) {

        this.options = options || null;
        
        this._hook     = 'data-search-filters';
        this._dropdown = 'data-dropdown';
        this._savvy    = 'data-savvy-search';
        this._modal    = 'data-modal-search';

        let studentSlugs =  Object.entries(studentObj).map(([idx, obj]) => obj.slug);

        this.criteria = {
            'students': studentSlugs
        }
        
        this._active = '_is-active';
        this._inactive = '_is-inactive';

        this.bind();

    }


    bind() {

        let self = this;

        self.init();

    }

    getData(form) {

        let self = this;

        let formData = new FormData(form),
            searchObj  = Object.fromEntries(formData);
        
        return searchObj;

    }

    convertDate(serial) {

        let self = this;
        
        let utcDays  = Math.floor(serial - 25569),
            utcValue = utcDays * 86400,                                     
            dateInfo = new Date(utcValue * 1000);
     
        let fractionalDay = serial - Math.floor(serial) + 0.0000001,
            totalSeconds = Math.floor(86400 * fractionalDay),
            seconds      = totalSeconds % 60;
     
        totalSeconds -= seconds;
     
        let hours   = Math.floor(totalSeconds / (60 * 60)),
            minutes = Math.floor(totalSeconds / 60) % 60;
     
        //return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
    
        return `${dateInfo.getMonth()}.${dateInfo.getDate()}.${dateInfo.getFullYear()}`;

    }

    capitalize(str) {
        const lower = str.toLowerCase();
        return str.charAt(0).toUpperCase() + lower.slice(1);
    }

    titleCase(str) {

        let self = this;
        
        let words = str.split('_');

        let title = [];

        words.forEach(w => {
            title.push(self.capitalize(w));
        });
        
        title = title.join(' ');

        return title;
    }

    loopThroughTranslator(obj,needle) {

        let self = this;

        let success;

        const searchHaystack = (haystack,needle,category = '') => {

            for ( let [key,value] of haystack ) {
                
                if ( ( key.toLowerCase() === needle.toLowerCase() ) && typeof value === 'string' ) {
                    if ( value === '' ) {
                        value = self.titleCase(key);
                    }
                    success = {'label': value, 'category': self.capitalize(category)};
                    return success;
                }
                else if ( typeof value === 'object' ) {
                    searchHaystack(Object.entries(value),needle,key);
                }
                
            }

            return success;
        }

        return searchHaystack(obj,needle);

    }

    getResults(obj) {

        let self = this;

        let item = [];

        const translator = Object.entries(translatorObj);

        let results = {};

        for ( const [k,v] of Object.entries(obj) ) {
            
            // If value irrelevant, skip.
            if ( typeof v === null || typeof v === 'string' && ( v.toLowerCase() === 'null' || v.trim() === '' ) || v === 0 ) continue;
            
            let slug    = k.toLowerCase(),
                variant = slug.replace(/_/g, '-');

            let success  = self.loopThroughTranslator(translator,slug),
                category = success.category,
                label    = success.label;
            
            let value = variant === 'program-status-date' ? self.convertDate(v) : v;

            let item = {'label': label, 'value': value, 'variant': variant};

            if ( !Object.keys(results).includes(category) ) {
                results[category] = [];
            }

            results[category].push(item);

        }

        return results;

    }

    resultTmpl(obj) {

        let self = this;

        let item = [];

        const translator = Object.entries(translatorObj);

        let details = {};

        for ( const [k,v] of Object.entries(obj) ) {
            
            // If value irrelevant, skip.
            if ( typeof v === null || typeof v === 'string' && ( v.toLowerCase() === 'null' || v.trim() === '' ) || v === 0 ) continue;
            
            let slug    = k.toLowerCase(),
                variant = slug.replace(/_/g, '-');

            let success  = self.loopThroughTranslator(translator,slug),
                category = success.category,
                label    = success.label;
            
            let value = variant === 'program-status-date' ? self.convertDate(v) : v;

            let item = '';

            console.log(category);

            let checkmarks = ['Students','Instruction','Prerequisites'],
                colons     = ['Contact'];

            // Massage the content
            if ( checkmarks.includes(category) && value === 1) {
                item = [`<div class="resultItem-detail resultItem-detail--${variant}">`,
                            `<div class="resultItem-detail-dd">&#x2713 ${label}</div>`,
                        `</div>`];
            }
            else if ( colons.includes(category) ) {
                item = [`<div class="resultItem-detail resultItem-detail--${variant}">`,
                            `<div class="resultItem-detail-dd">${label}: ${value}</div>`,
                        `</div>`];
            }
            else {

                item = [`<div class="resultItem-detail resultItem-detail--${variant}">`,
                            `<h4 class="resultItem-detail-dt">${label}</h4>`,
                            `<div class="resultItem-detail-dd">${value === 1 ? '&#x2713' : value}</div>`,
                        `</div>`];
            }

            if ( !Object.keys(details).includes(category) ) {
                details[category] = [];
            }

            details[category].push(item.join(''));
    
        }

        let tmpl = [];

        for ( const [category,list] of Object.entries(details) ) {

            tmpl.push([
                `<div class="resultItem-group resultItem-group--${category.toLowerCase()}">`,
                    `<h3 class="resultItem-category">${category}</h3>`,
                    `<div class="resultItem-list">`,
                        `${list.join('')}`,
                    `</div>`,
                `</div>`].join(''));

        }

        tmpl = tmpl.join('');

        return `<div class="resultItem">${tmpl}</div>`;

    }

    resetProgram() {

        let self = this;

        const searchTrigger = document.querySelector(`[${self._savvy}="trigger"]`);

        // Clear search input
        searchTrigger.value = '';
        // Clear results
    }

    clearSearchInput(e,outputList) {

        let self = this;

        let resetButton = e.target;
        
        outputList.innerHTML = '';
        outputList.classList.remove(self._active);
        // Clear hidden program value
        self.searchId.value = '';
        // Clear visible input
        if (  self.searchTrigger.value.length ) {
            self.searchTrigger.value = '';
        }
        // Hide reset button
        resetButton.classList.add(self._inactive);
        
        // 
        self.updateBreadcrumbs('all','All Organizations');

        e.stopPropagation();
        
        return;
    

    }

    initSavvySearch(form) {

        let self = this;

        const outputList  = form.querySelector(`[${self._savvy}="output"]`),
              resetButton = form.querySelector(`[${self._savvy}="reset"]`);
        
        const selector = form.classList[0];

        // const arr = Object.entries(programObj).map(([idx, obj]) => obj.program_name);
        const arr = Object.entries(programObj).map(([idx, obj]) => [ obj.program_id, obj.program_name ] );

        const makeItSavvy = (e) => {

            let searchValue = !!e ? e.target.value : '';

            if ( searchValue.length == 0 ) {
                self.clearSearchInput(e,outputList);
            }

            const filtered = arr.filter((item) => {
                let itemName   = item[1],
                    itemSlug   = itemName.toLowerCase(),
                    searchSlug = searchValue.toLowerCase();
                return itemSlug.includes(searchSlug);
            });

            if ( filtered.length ) {
                outputList.classList.add(self._active);
            }
            else {
                outputList.classList.remove(self._active);
            }

            let outputItem = '';
            for ( const item of filtered ) {
                outputItem += `<li class="${selector}-output-li" data-search-id="${item[0]}" data-savvy-search="select">${item[1]}</li>`;
            }

            outputList.innerHTML = outputItem;

        };

        // Visitor types into search input
        self.searchTrigger.addEventListener('keyup', makeItSavvy);

        // Visitor clicks the "x" clear icon within search input
        resetButton.addEventListener('click', (e) => {
            self.clearSearchInput(e,outputList);
        });

        // Visitor selects option from intellisearch output list
        outputList.addEventListener('click', (e) => {
            
            const target = e.target.closest(`[${self._savvy}="select"]`);

            if ( target ) {

                let activeValue = target.textContent.trim(),
                    activeId    = target.dataset.searchId;

                // Update visible input
                self.searchTrigger.value = activeValue;
                // Make visible the reset button
                resetButton.classList.remove(self._inactive);
                // Update hidden input
                self.searchId.value = activeId;
                // Clear output
                outputList.innerHTML = '';
                outputList.classList.remove(self._active);
                // Update breadcrumbs
                self.updateBreadcrumbs(activeId,activeValue);

            }
            
        });

    }

    initDropdown(form) {

        let self = this;

        const inputTriggers = form.querySelectorAll(`[${self._dropdown}="trigger"]`),
              inputTarget   = form.querySelector(`[${self._dropdown}="target"]`),
              inputLabel    = form.querySelector(`[${self._dropdown}="label"]`);


        inputTriggers.forEach((input) => {
            input.addEventListener('change', (e) => {
                let selectedId    = e.target.id,
                    selectedLabel = form.querySelector(`label[for="${selectedId}"]`).innerHTML;
                // Programmatically close faux select dropdown on input change
                inputTarget.click();
                // Toggle label
                inputLabel.innerHTML = selectedLabel;
            });
        });

    }

    updateBreadcrumbs(id,label) {

        let self = this;

        const criteriaList = document.querySelector(`[${self._hook}="criteria"]`);

        let activeItems  = document.querySelectorAll(`[data-search-criteria]`),
            newProgramId = (typeof parseInt(id) === 'number') ? parseInt(id) : null;

        let dupeItem = document.querySelector(`[data-search-criteria="${id}"]`);

        let newCrumb = '';

        activeItems.forEach(item => {
            let itemData  = item.dataset.searchCriteria,
                programId = (typeof parseInt(itemData) === 'number') ? parseInt(itemData) : null;
            // Handle program filter
            if ( (itemData === 'all' && newProgramId) || ( programId !== newProgramId )) {
                item.remove();
            }
        });

        if ( !dupeItem ) {
            newCrumb = `<li class="searchForm-criteria-li" data-search-criteria="${id}">${label}</li>`;
            criteriaList.innerHTML += newCrumb;
        }

    }

    initModalSearch() {

        let self = this;

        const clearButton = document.querySelectorAll(`[${self._modal}="clear"]`),
              applyButton = document.querySelectorAll(`[${self._modal}="apply"]`),
              resetButton = document.querySelector(`[${self._savvy}="reset"]`);

        const criteriaList = document.querySelector(`[${self._hook}="criteria"]`);
        
        clearButton.forEach(button => {       
            
            button.addEventListener('click', (e) => {
            
                let form = e.target.closest(`[${self._modal}="form"]`),
                    key  = form.dataset.searchKey;

                let activeTriggers = form.querySelectorAll(`[${self._modal}="trigger"]:checked`);
                
                if ( activeTriggers.length === 0 && key === 'organizations' ) {
                    self.resetProgram();
                }
                else {

                    activeTriggers.forEach(trigger => {
                        trigger.checked = false;
                    });

                }
            
            });
            
        });

        applyButton.forEach(button => { 
        
            button.addEventListener('click', (e) => {
            
                let form = e.target.closest(`[${self._modal}="form"]`),
                    key  = form.dataset.searchKey;

                let activeTriggers = form.querySelectorAll(`[${self._modal}="trigger"]:checked`);

                let criteriaItem = '';
                
                if ( activeTriggers.length === 0 && key === 'organizations' ) {
                    self.resetProgram();
                }
                else {

                    // Clear criteria
                    let allTriggers = form.querySelectorAll(`[${self._modal}="trigger"]`);

                    allTriggers.forEach(trigger => {

                        let targetId    = trigger.id,
                            activeValue = trigger.value,
                            activeLabel = form.querySelector(`label[for="${targetId}"]`).textContent.trim();
                        
                        let isActive = trigger.checked;

                        if ( isActive ) {
                            if ( key === 'organizations' ) {
                                // Update search input
                                self.searchTrigger.value = activeLabel;
                                self.searchId.value = activeValue;
                                // Make visible the reset button
                                resetButton.classList.remove(self._inactive);
                            }
                            else {

                                // something
                                let dupeItem = document.querySelector(`[data-search-criteria="${targetId}"]`);

                                if ( !dupeItem ) {
                                    criteriaItem = `<li class="searchForm-criteria-li" data-search-criteria="${targetId}">${activeLabel}</li>`;
                                    criteriaList.innerHTML += criteriaItem;
                                }
                            }
                        }
                        else {
                            // something
                            let removeItem = document.querySelector(`[data-search-criteria="${targetId}"]`);

                            if ( removeItem ) {
                                removeItem.remove();
                            }
                        }

                    });
                    
                }
            
            });

        });

    }

    // handleResults:
    // NOTE: form keys (i.e. input name attrs) should match json keys
    handleResults(e) {

        let self = this;

        const searchResults = document.querySelector(`[${self._hook}="results"]`);

        let searchObj  = self.getData(e.target);

        const blackList = ['name_program_id','modal_program_id'];

        // Remove friendly key
        for ( const [k,v] of Object.entries(searchObj) ) {
            if ( blackList.includes(k) ) {
                delete searchObj[k];
            }
        }

        let searchKeys = Object.keys(searchObj),
            programArr = Object.entries(programObj);
        
        // console.log(programArr);
        // console.log('search ', searchKeys);

        let selectedPrograms = [];

        let searchAll = (searchKeys.includes('program_id') && searchObj['program_id'] === '' && searchKeys.length === 1),
            programId = searchKeys.includes('program_id') && !searchAll ? parseInt(searchObj['program_id']) : null;

        if ( programId ) {

            let meetsCriteria = false;
            
            let program = programArr.filter(([idx, obj]) => obj['program_id'] === programId )[0][1];

            for ( const [k,v] of Object.entries(searchObj) ) {
                meetsCriteria = ( parseInt(program[k]) ===  1 || k === 'program_id');
            }

            if ( meetsCriteria ) {
                selectedPrograms.push(program);
            }

        }
        else {

            for ( const [idx,program] of programArr ) {

                let meetsCriteria = searchAll;
                
                if ( !searchAll ) {
                    for ( const [k,v] of Object.entries(searchObj) ) {
                        meetsCriteria = ( parseInt(program[k]) ===  1);
                    }
                }

                if ( meetsCriteria ) {
                    selectedPrograms.push(program);
                }

            }

        }
        
        if ( selectedPrograms ) {

            // Empty results before next search, display result count
            searchResults.innerHTML = `<h2 class="searchResults-count">Showing ${selectedPrograms.length} Result${ selectedPrograms.length > 1 ? 's' : ''}</h2>`;

            selectedPrograms.forEach((obj,idx) => {

                let tmpl = self.resultTmpl(obj);
                searchResults.innerHTML += tmpl;
            
            });

            searchResults.classList.remove(self._inactive);

            setTimeout(() => {
                searchResults.scrollIntoView(true, {behavior: 'smooth'});
            }, 500);

        }
        else {

        }

    }

    init() {

        let self = this;
        
        const searchForm = document.querySelector(`[${self._hook}="form"]`);
              
        if ( searchForm ) {

            const dropdownForm = searchForm.querySelector(`[${self._dropdown}="form"]`);
            const savvyForm    = searchForm.querySelector(`[${self._savvy}="form"]`);

            // abstract these
            self.searchTrigger = document.querySelector(`[${self._savvy}="trigger"]`),
            self.searchId      = document.querySelector(`[${self._savvy}="id"]`);
            
            if ( savvyForm ) {
                self.initSavvySearch(savvyForm);
            }
            
            if ( dropdownForm ) {
                self.initDropdown(dropdownForm);
            }

            self.initModalSearch();

            searchForm.addEventListener('submit', (e) => {
                
                e.preventDefault();

                self.handleResults(e);

            });
        
        }

    }

}
export default searchFilters;