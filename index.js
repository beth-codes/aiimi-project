let debounceTimer;
let selectedUsers = [];
let userDataDisplayed = {};
let showPopup = document.querySelector('.popup-content');

// Function to debounce search operation
function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}
// Function to perform search as user types
function handleSearchInput() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    if (searchInput.length > 1) {
        debounce(searchUsers, 300);
    } else {
        clearResults();
    }
}

// Add event listener for input event on search input field
document.getElementById('searchInput').addEventListener('input', handleSearchInput);

//toggle form visibility
document.getElementById('newUserButton').addEventListener('click', function () {
    const userFormContainer = document.getElementById('userFormContainer');
    userFormContainer.classList.toggle("active");
});

async function searchUsers() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();

    try {
        const response = await fetch(`https://aiimi-backend.azurewebsites.net/api/users/`);
        const data = await response.json();

        // Filter the data based on the search input
        const filteredData = data.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchInput);
        });

        // Update UI with search results
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        if (filteredData.length === 0) {
            resultsContainer.textContent = 'No matching users found.';
            return;
        }

        filteredData.forEach(user => {
            const userElement = document.createElement('p');
            userElement.textContent = `${user.firstName} ${user.lastName}`;
            userElement.classList.add('search-result-para');
            userElement.dataset.user = JSON.stringify(user);
            resultsContainer.appendChild(userElement);
        });
    } catch (error) {
        console.error('Error searching users:', error);
        alert('Error searching users. Please try again.');
    }
}

// Clear search results
function clearResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
}

// Event delegation to handle clicks on search results
document.getElementById('results').addEventListener('click', function (event) {
    const clickedElement = event.target.closest('.search-result-para');
    if (clickedElement) {
        const userData = JSON.parse(clickedElement.dataset.user);
        if (!userDataDisplayed[userData.id]) {
            selectedUsers.push(userData);
            displayUserInfo(userData);
            userDataDisplayed[userData.id] = true;
        }
    }
});

// Function to display user information in a container
function displayUserInfo(user) {
    const userInfoContainer = document.createElement('div');
    userInfoContainer.classList.add('selected-employees-item');
    userInfoContainer.innerHTML = `
        <p> ${user.firstName} ${user.lastName}</p>
        <p>${user.jobTitle}</p>
        <p> ${user.phoneNumber}</p>
        <p>${user.email}</p>
    `;
    document.getElementById('userDetails').appendChild(userInfoContainer);
}

document.getElementById('addUserForm').addEventListener('submit', async function (event) {
    console.log('Form submitted');
    event.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const phoneNumber = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!firstName || !lastName || !validateEmail(email) || !validatePhoneNumber(phoneNumber)) {
        this.classList.add('border-warn');
        return;
    }

    const userData = { firstName, lastName, jobTitle, phoneNumber, email };

    // Check if the user data already exists
    const isDuplicate = selectedUsers.some(user => {
        return (
            user.firstName === userData.firstName &&
            user.lastName === userData.lastName &&
            user.email === userData.email &&
            user.phoneNumber === userData.phoneNumber
        );
    });

    if (isDuplicate) {
        alert('Duplicate user data. Please enter unique user information.');
        return;
    }

    try {
        // Send user data to the mock service for adding
        const response = await fetch('https://aiimi-backend.azurewebsites.net/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showPopup.classList.toggle('active');
            this.reset();
            selectedUsers.push(userData);
        } else {
            alert('Failed to add user.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Error adding user. Please try again.');
    }
});


// Validate email format
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate phone number format
function validatePhoneNumber(phoneNumber) {
    const regex = /^\d{10}$/;
    return regex.test(phoneNumber.replace(/\s/g, ''));
}
