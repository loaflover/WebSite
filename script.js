// This script dynamically fetches and displays a list of GitHub repositories,
// categorized into latest and starred projects.
window.onload = function() {
    const githubUsername = 'LoafLover';
    const reposPerCategory = 3;
    const repoContainer = document.getElementById('repo-container');
    const startTime = Date.now(); // Record the time the page was loaded
    const birthDate = new Date('2005-02-21T00:00:00Z').getTime(); // Use a specific birthdate in UTC for consistent calculations

    /**
     * Updates the "My Time" section to show the percentage of life spent on the page.
     */
    function updateLifePercentage() {
        const currentTime = Date.now();
        const elapsedTimeOnPage = currentTime - startTime;
        const totalLifeTime = currentTime - birthDate;
        
        // Calculate the percentage
        const percentage = (elapsedTimeOnPage / totalLifeTime) * 100;
        
        // Update the element with a high-precision value
        document.getElementById('percentage').innerText = `${percentage.toFixed(15)}%`;
    }

    // Call updateLifePercentage every 1 second for a smooth update
    setInterval(updateLifePercentage, 1000);

    // Define the API endpoints for each category.
    const apiEndpoints = {
        latest: `https://api.github.com/users/${githubUsername}/repos?sort=pushed&per_page=${reposPerCategory}`,
        starred: `https://api.github.com/users/${githubUsername}/starred?per_page=${reposPerCategory}`
    };

    /**
     * Fetches a list of repositories from a given URL.
     * @param {string} url The GitHub API endpoint URL.
     * @returns {Promise<Array>} A promise that resolves with an array of repository objects.
     */
    async function fetchRepos(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Renders a single repository card.
     * @param {object} repo The repository object from the GitHub API.
     * @returns {string} The HTML string for the repo card.
     */
    function renderRepoCard(repo) {
        return `
            <a href="${repo.html_url}" target="_blank" class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 block text-left">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">${repo.name}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${repo.description || 'No description provided.'}</p>
                <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <!-- Language display, or an empty span if no language is specified -->
                    ${repo.language ? `
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                        </svg>
                        <span>${repo.language}</span>` : ''}
                </div>
            </a>
        `;
    }

    /**
     * Renders a full category section with a title and repo cards.
     * @param {string} title The title for the category.
     * @param {Array} repos The array of repository objects to display.
     * @returns {string} The complete HTML string for the category section.
     */
    function renderCategory(title, repos) {
        if (!repos || repos.length === 0) {
            return `
                <div class="col-span-full text-center">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">${title}</h3>
                    <p class="text-gray-500 dark:text-gray-400">No projects found in this category.</p>
                </div>
            `;
        }

        const repoCards = repos.map(renderRepoCard).join('');
        return `
            <div class="col-span-full text-center mb-4">
                <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">${title}</h3>
            </div>
            ${repoCards}
        `;
    }

    /**
     * Main function to fetch and display all categories of repositories.
     */
    async function fetchAndDisplayAllRepos() {
        repoContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 col-span-full">Loading projects...</p>`;

        try {
            const [latestRepos, starredRepos] = await Promise.all([
                fetchRepos(apiEndpoints.latest),
                fetchRepos(apiEndpoints.starred)
            ]);

            let htmlContent = '';
            htmlContent += renderCategory("Latest Worked On", latestRepos);
            htmlContent += renderCategory("Starred Repositories", starredRepos);

            repoContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error("Failed to fetch GitHub repositories:", error);
            repoContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Failed to load projects. Please try again later.</p>`;
        }
    }

    // New function to handle the single-user visit counter
    function updateVisitCounter() {
        // Check if localStorage is supported
        if (typeof(Storage) !== "undefined") {
            // Get the current count from localStorage, defaulting to 0 if it doesn't exist
            let count = localStorage.getItem('pageVisits');

            // If there is no count, initialize it to 1, otherwise increment it
            if (count === null) {
                count = 1;
            } else {
                count = parseInt(count) + 1;
            }

            // Save the new count back to localStorage
            localStorage.setItem('pageVisits', count);

            // Update the counter on the page
            document.getElementById('visitor-count').innerText = count;
        } else {
            // If localStorage is not supported, display a message
            document.getElementById('visitor-count').innerText = "Storage not supported.";
        }
    }

    // Call the new function to update the counter
    updateVisitCounter();
    fetchAndDisplayAllRepos();

    // IntersectionObserver for active navigation links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null, // use the viewport
        rootMargin: '0px',
        threshold: 0.5 // trigger when 50% of the section is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            const targetId = entry.target.id;
            const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);

            if (activeLink) {
                if (entry.isIntersecting) {
                    activeLink.classList.remove('text-gray-600', 'dark:text-gray-400');
                    activeLink.classList.add('text-indigo-600', 'dark:text-indigo-400');
                } else {
                    activeLink.classList.remove('text-indigo-600', 'dark:text-indigo-400');
                    activeLink.classList.add('text-gray-600', 'dark:text-gray-400');
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
};
