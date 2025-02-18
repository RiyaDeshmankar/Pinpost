// Dark Mode Toggle
let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
};

if (darkmode === 'active') enableDarkmode();

themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

// Unsplash API Setup
const gallery = document.querySelector(".pcontainer");
const loading = document.querySelector(".loading");
const searchForm = document.querySelector(".search-bar");
const searchInput = document.querySelector(".search-bar input");

const ACCESS_KEY = "Ji5bjEFQluftwIeP5UbPDoeKPgxyBN-mlETnm_L6ybc"; // Replace with your Unsplash API key

let isFetching = false;
let searchResults = [];
let isSearchMode = false; // Track if we are in search mode

// Fetch Images from Unsplash API
async function fetchImages(query = "", page = 1) {
    if (isFetching) return;
    isFetching = true;
    loading.style.display = "block";

    try {
        let url;
        if (query) {
            url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${ACCESS_KEY}&per_page=12&page=${page}`;
        } else {
            url = `https://api.unsplash.com/photos/random?client_id=${ACCESS_KEY}&count=6`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch images");

        const data = await response.json();
        let images = query ? data.results : data; // Use search results or random images

        // If it's a new search, reset the gallery
        if (query && page === 1) {
            gallery.innerHTML = "";
            searchResults = images; // Store search results
            isSearchMode = true;
        } else if (query) {
            searchResults.push(...images);
        }

        displayImages(images);

        // If no search results are left, switch to random images
        if (query && searchResults.length === 0) {
            isSearchMode = false;
        }

    } catch (error) {
        console.error("Error fetching images:", error);
    } finally {
        loading.style.display = "none";
        isFetching = false;
    }
}

// Function to Display Images
function displayImages(images) {
    images.forEach(photo => {
        let div = document.createElement("div");
        div.classList.add("photo");

        let img = document.createElement("img");
        img.src = photo.urls.small;
        img.loading = "lazy";
        img.alt = photo.alt_description || "Unsplash Image";

        let btn = document.createElement("a");
        btn.classList.add("download-btn");
        btn.innerHTML = '<i class="fa-solid fa-download"></i>';
        btn.onclick = () => downloadImage(photo.urls.full);

        // 🔗 Share Button
        let shareBtn = document.createElement("button");
        shareBtn.classList.add("share-btn");
        shareBtn.innerHTML = '<i class="fa-solid fa-share"></i>';
        shareBtn.onclick = () => shareOnSocials(photo.urls.full, "Check out this amazing image!");

        div.appendChild(img);
        div.appendChild(btn);
        div.appendChild(shareBtn);
        gallery.appendChild(div);
    });
}

// Download Function for API Images
function downloadImage(imageUrl) {
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = "image.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        })
        .catch(error => console.error("Error downloading the image:", error));
}

// 🔗 Share Function
function shareOnSocials(imageUrl, text) {
    let absoluteUrl = new URL(imageUrl, window.location.href).href;

    if (navigator.share) {
        navigator.share({
            title: "Pinpost Image",
            text: text,
            url: absoluteUrl
        }).catch(err => console.error("Error sharing:", err));
    } else {
        alert("Sharing not supported on this browser.");
    }
}

// Search Functionality
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        fetchImages(query, 1);
    }
});

// Infinite Scroll Observer
const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !isFetching) {
        if (isSearchMode && searchResults.length > 0) {
            // If search results exist, load more search images
            fetchImages(searchInput.value, Math.ceil(searchResults.length / 12) + 1);
        } else {
            // Otherwise, load random images
            fetchImages();
        }
    }
}, { rootMargin: "200px" });

const trigger = document.querySelector(".load-more-trigger");
observer.observe(trigger);

// Load Initial Images
fetchImages();
