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

        // No longer using
        // let studentSlugs =  Object.entries(studentObj).map(([idx, obj]) => obj.slug);
        // this.criteria = {
        //     'students': studentSlugs
        // }

        this.programIdKey       = 'PROGRAM_ID';
        this.programNameKey     = 'PROGRAM_NAME';
        this.programServicesKey = 'SERVICEIDS';
        this.programKeywordKey  = 'KEYWORDS';   
        
        this._active   = '_is-active';
        this._inactive = '_is-inactive';

        this.bind();

    }


    bind() {

        let self = this;

        self.init();

    }

    getData(form) {

        let self = this;

        let formData  = new FormData(form),
            searchObj = Object.fromEntries(formData);
        
        // Ensure all services_id values are extracted
        // 'fromEntries method will only pull the *last* 
        if ( 'services_id[]' in searchObj ) {
            let allIds = formData.getAll('services_id[]');
            searchObj['services_id[]'] = allIds;
        }
        
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

    // getResults
    // old
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

        //const translator = Object.entries(translatorObj);

        let details = {};

        for ( const [k,v] of Object.entries(obj) ) {
            
            // If value irrelevant, skip.
            if ( typeof v === null || typeof v === 'string' && ( v.toLowerCase() === 'null' || v.trim() === '' ) || v === 0 ) continue;
            
            if ( (Object.keys(details)).includes('id') && (Object.keys(details)).includes('name') ) continue;

            // Only need to extract id and name for now
            if ( k == self.programIdKey ) {
                details['id'] = v;
            }
            if ( k == self.programNameKey ) {
                details['name'] = v;
            }        
        }

        let tmpl = `<article class="cardItem">
                        <h2 class="cardItem-title">
                            <a href="../../detail/${details.id}" title="View details for ${details.name}">${details.name}</a>
                        </h2>
                        <a class="cardItem-action" href="../../detail/${details.id}" title="View details for ${details.name}">
                            <span class="cardItem-action-label">Read More</span>
                            <span class="cardItem-action-icon cardItem-action-icon--sm">
                                <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.89645 13.9745L5.71967 14.1513C5.42678 14.4442 5.42678 14.9191 5.71967 15.2119C6.01256 15.5048 6.48744 15.5048 6.78033 15.2119L10.4926 11.4996L10.4926 11.4996L10.4927 11.4996L11.4928 10.4995L10.4928 9.49957L10.4929 9.49951L6.78057 5.7872C6.48768 5.49431 6.01281 5.49431 5.71991 5.7872C5.42702 6.08009 5.42702 6.55497 5.71991 6.84786L5.89669 7.02464C6.143 7.27095 6.38931 7.43146 6.71033 7.64066C7.27346 8.00763 8.06649 8.52442 9.49271 9.91696L9.49264 10.4995L9.49271 11.0819C8.06633 12.4747 7.27325 12.9915 6.71009 13.3585C6.38906 13.5677 6.14276 13.7282 5.89645 13.9745ZM10.7196 14.1513L10.8964 13.9745C11.1427 13.7282 11.389 13.5677 11.7101 13.3585C12.2732 12.9915 13.0663 12.4747 14.4927 11.0819L14.4926 10.4997L14.4927 9.91715C13.0665 8.52457 12.2734 8.00777 11.7103 7.6408C11.3893 7.4316 11.143 7.27109 10.8966 7.02478L10.7199 6.848C10.427 6.55511 10.427 6.08023 10.7199 5.78734C11.0128 5.49445 11.4876 5.49445 11.7805 5.78734L15.4928 9.49965L15.4927 9.49974L15.4928 9.49974L16.4928 10.4997L15.4927 11.4997L15.4925 11.4997L11.7803 15.212C11.4874 15.5049 11.0125 15.5049 10.7196 15.212C10.4267 14.9191 10.4267 14.4442 10.7196 14.1513Z" />
                                </svg>
                            </span>
                        </a>
                    </article>`;
            
        return tmpl;

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

        const arr = Object.entries(programObj).map(([idx, obj]) => [ obj[self.programIdKey], obj[self.programNameKey] ] );

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

        let searchObj  = self.getData(e.target); // e.g. {program_id: '22'}

        const blackList = ['name_program_id','modal_program_id'];

        // Remove friendly key
        for ( const [k,v] of Object.entries(searchObj) ) {
            if ( blackList.includes(k) ) {
                delete searchObj[k];
            }
        }

        let searchKeys = Object.keys(searchObj),     // e.g. ['program_id']
            programArr = Object.entries(programObj); // e.g. [array containing all programs]

        let selectedPrograms = [];

        let searchAll = (searchKeys.includes('program_id') && searchObj['program_id'] === '' && searchKeys.length === 1),
            programId = searchKeys.includes('program_id') && !searchAll ? parseInt(searchObj['program_id']) : null;

        // Implement Exclusive Search!!!
        // If programId exists this means we are searching on a specific program
        if ( programId ) {

            let meetsCriteria = false;
            
            // Return the program object
            let program = programArr.filter(([idx, obj]) => obj[self.programIdKey] === programId )[0][1];

            for ( const [k,v] of Object.entries(searchObj) ) {
                meetsCriteria = ( parseInt(program[k]) ===  1 || k === 'program_id');
            }

            if ( meetsCriteria ) {
                selectedPrograms.push(program);
            }

        }
        // Search all programs
        else {

            for ( const [idx,program] of programArr ) {
                
                // Search all and *only* programs = true/false
                let meetsCriteria = searchAll;

                // If searching all programs *and* additional filters
                //////////////////////////////////////////////////////
                if ( !searchAll ) {

                    let searchKeys = Object.keys(searchObj);

                    // Determine if and how many student filters are applied
                    let studentFilters = searchKeys.filter(k => { return k.startsWith('sta_') }),
                        serviceFilters = searchKeys.filter(k => { return k.startsWith('services_id[]') }).length ? searchObj['services_id[]'] : null,
                        keywordFilters = searchKeys.filter(k => { return k.startsWith('keywords[]') }).length ? searchObj['keywords[]'] : null;

                    let studentCount = 0,
                        serviceCount = 0,
                        keywordCount = 0;
                    
                    let studentCriteria = false,
                        serviceCriteria = false,
                        keywordCriteria = false;

                    console.log(searchKeys);
                    console.log(keywordFilters);
    
                    // Student Slug Search
                    if ( studentFilters ) {
                        for ( let idx in studentFilters ) {
                            let key = studentFilters[idx].toUpperCase();
                            if ( program[key] ) {
                                studentCount += 1;
                            }
                        }
                        studentCriteria = (studentFilters.length === studentCount );
                    }
                    // Keyword Search
                    if ( keywordFilters ) {
                        
                        let keywordString = program[self.programServicesKey],
                            keywordArr   = ( keywordString && keywordString !== '' ) ? keywordString.split(',') : null;
                        
                        if ( keywordArr ) {
                            for ( let idx in keywordFilters ) {
                                if ( keywordArr.includes(keywordFilters[idx]) ) {
                                    keywordCount += 1;
                                }
                            }
                            keywordCriteria = ( keywordFilters.length === keywordCount );
                        }
                        
                    }

                    // Service ID search
                    if ( serviceFilters ) {
                        // Cast service id string on program object to array
                        let serviceString = program[self.programServicesKey],
                            serviceArr    = ( serviceString && serviceString !== '' ) ? serviceString.split(',') : null;
                        
                        if ( serviceArr ) {
                            for ( let idx in serviceFilters ) {
                                if ( serviceArr.includes(serviceFilters[idx]) ) {
                                    serviceCount += 1;
                                }
                            }
                            serviceCriteria = (serviceFilters.length === serviceCount );
                        }
                    }

                    // Qualifying criteria
                    if ( ( studentFilters && serviceFilters && keywordFilters ) && ( studentCriteria && serviceCriteria && keywordCriteria ) ) {
                        meetsCriteria = true;
                    }
                    else if ( ( studentFilters && studentCriteria ) || ( serviceFilters && serviceCriteria ) || ( keywordFilters && keywordCriteria ) ) {
                        meetsCriteria = true;
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
            searchResults.innerHTML += `<div class="searchResults-container"></div>`;
            
            let container = document.querySelector('.searchResults-container');

            selectedPrograms.forEach((obj,idx) => {
                let tmpl = self.resultTmpl(obj);
                container.innerHTML += tmpl;
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