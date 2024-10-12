document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const authSection = document.getElementById("auth");
    const profileSection = document.getElementById("profile");
    const contentCreateSection = document.getElementById("content-create");
    const socialFeedSection = document.getElementById("social-feed");
    const feed = document.getElementById("feed");
    const friendsSection = document.getElementById("friends-section");
    const dmSection = document.getElementById("dm-section");

    // Variables for user data, friends, DMs, and posts
    let currentUser = null;
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let friends = JSON.parse(localStorage.getItem("friends")) || {};
    let dms = JSON.parse(localStorage.getItem("dms")) || {};

    // Check if localStorage is available
    if (typeof(Storage) !== "undefined") {
        console.log("localStorage is available");
    } else {
        console.log("localStorage is not supported in this environment");
    }

    // Show Register Form
    document.getElementById("show-register").addEventListener("click", function() {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    // Show Login Form
    document.getElementById("show-login").addEventListener("click", function() {
        registerForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Handle Registration
    document.getElementById("register-btn").addEventListener("click", function() {
        const username = document.getElementById("register-username").value.trim();
        const password = document.getElementById("register-password").value.trim();

        if (username && password) {
            // Store user credentials in localStorage
            users.push({ username, password, profilePic: 'default-avatar.jpg', bio: '' });
            localStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful! Please log in.");
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        } else {
            alert("Please fill in all fields.");
        }
    });

    // Handle Login
    document.getElementById("login-btn").addEventListener("click", function() {
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        // Log to check the stored users in localStorage
        console.log("Users in LocalStorage:", users);

        // Find the user in users array
        currentUser = users.find(user => user.username === username && user.password === password);

        // Debug: Log the result of the login attempt
        console.log("Current User:", currentUser);

        if (currentUser) {
            // Hide auth section and show content creation section
            authSection.style.display = "none";
            profileSection.style.display = "block";
            contentCreateSection.style.display = "block";
            socialFeedSection.style.display = "block";
            friendsSection.style.display = "block";
            dmSection.style.display = "block";
            loadFeed();
            loadProfile();
            loadFriends();
            loadDMs();
        } else {
            alert("Invalid login credentials.");
        }
    });

    // Load Feed
    function loadFeed() {
        feed.innerHTML = "";  // Clear the current feed

        posts.forEach((post, index) => {
            const postElement = document.createElement("div");
            postElement.classList.add("video-container");

            const videoElement = document.createElement("video");
            videoElement.src = post.videoUrl;
            videoElement.controls = true;
            videoElement.preload = "auto"; // Preload the video
            videoElement.autoplay = true;  // Start the video immediately
            videoElement.loop = true;      // Loop the video after it ends
            videoElement.addEventListener('ended', function() {
                videoElement.currentTime = 0; // Restart the video when it ends
                videoElement.play(); // Start playing from the beginning
            });

            postElement.appendChild(videoElement);

            const descriptionElement = document.createElement("p");
            descriptionElement.innerText = post.videoDescription;
            postElement.appendChild(descriptionElement);

            const likeBtn = document.createElement("button");
            likeBtn.classList.add("like-btn");
            likeBtn.innerText = `Like (${post.likes})`;
            likeBtn.addEventListener("click", function() {
                post.likes++;
                posts[index] = post;
                localStorage.setItem("posts", JSON.stringify(posts));
                loadFeed();
            });
            postElement.appendChild(likeBtn);

            const commentBtn = document.createElement("button");
            commentBtn.classList.add("comment-btn");
            commentBtn.innerText = "Comment";
            commentBtn.addEventListener("click", function() {
                const comment = prompt("Enter your comment:");
                if (comment) {
                    post.comments.push(comment);
                    posts[index] = post;
                    localStorage.setItem("posts", JSON.stringify(posts));
                    loadFeed();
                }
            });
            postElement.appendChild(commentBtn);

            feed.appendChild(postElement);
        });
    }

    // Load User Profile
    function loadProfile() {
        document.getElementById("profile-username").value = currentUser.username;
        document.getElementById("profile-bio").value = currentUser.bio;
        document.getElementById("profile-pic").src = currentUser.profilePic;
    }

    // Save Profile
    document.getElementById("save-profile").addEventListener("click", function() {
        const profilePic = document.getElementById("upload-profile-pic").files[0];
        const bio = document.getElementById("profile-bio").value;

        if (profilePic) {
            const reader = new FileReader();
            reader.onloadend = function() {
                currentUser.profilePic = reader.result;
                currentUser.bio = bio;
                localStorage.setItem("users", JSON.stringify(users));
                alert("Profile saved!");
                loadProfile();
            };
            reader.readAsDataURL(profilePic);
        } else {
            currentUser.bio = bio;
            localStorage.setItem("users", JSON.stringify(users));
            alert("Profile saved!");
            loadProfile();
        }
    });

    // Upload Video
    document.getElementById("submit-video").addEventListener("click", function() {
        const videoFile = document.getElementById("video-upload").files[0];
        const description = document.getElementById("video-description").value.trim();

        if (videoFile && description) {
            const videoUrl = URL.createObjectURL(videoFile);
            const newPost = {
                username: currentUser.username,
                videoDescription: description,
                videoUrl: videoUrl,
                likes: 0,
                comments: []
            };

            posts.push(newPost);
            localStorage.setItem("posts", JSON.stringify(posts));
            alert("Video uploaded successfully!");
            loadFeed();
        } else {
            alert("Please provide a video and description.");
        }
    });

    // Add Friend
    document.getElementById("add-friend").addEventListener("click", function() {
        const friendUsername = document.getElementById("friend-username").value.trim();
        const friend = users.find(user => user.username === friendUsername);

        if (friend && friendUsername !== currentUser.username) {
            if (!friends[currentUser.username]) {
                friends[currentUser.username] = [];
            }

            if (!friends[currentUser.username].includes(friendUsername)) {
                friends[currentUser.username].push(friendUsername);
                localStorage.setItem("friends", JSON.stringify(friends));
                alert(`You are now friends with ${friendUsername}`);
                loadFriends();
            } else {
                alert("Already friends!");
            }
        } else {
            alert("Friend not found.");
        }
    });

    // Load Friends List
    function loadFriends() {
        const friendsList = document.getElementById("friends-list");
        friendsList.innerHTML = "";
        
        if (friends[currentUser.username]) {
            friends[currentUser.username].forEach(friend => {
                const friendElement = document.createElement("p");
                friendElement.innerText = friend;
                friendsList.appendChild(friendElement);
            });
        } else {
            friendsList.innerHTML = "You have no friends yet.";
        }
    }

    // Direct Messaging
    document.getElementById("send-dm").addEventListener("click", function() {
        const recipient = document.getElementById("send-dm-username").value.trim();
        const message = document.getElementById("dm-message").value.trim();

        if (recipient && message) {
            if (!dms[recipient]) {
                dms[recipient] = [];
            }

            dms[recipient].push({ sender: currentUser.username, message });
            localStorage.setItem("dms", JSON.stringify(dms));
            alert(`Message sent to ${recipient}`);
            loadDMs();
        } else {
            alert("Please provide a recipient and message.");
        }
    });

    // Load DM Threads
    function loadDMs() {
        const dmThreads = document.getElementById("dm-threads");
        dmThreads.innerHTML = "";
        
        Object.keys(dms).forEach(recipient => {
            const threadElement = document.createElement("div");
            threadElement.classList.add("dm-thread");
            
            const threadTitle = document.createElement("h3");
            threadTitle.innerText = `DM with ${recipient}`;
            threadElement.appendChild(threadTitle);

            const messagesList = document.createElement("div");
            dms[recipient].forEach(dm => {
                const messageElement = document.createElement("p");
                messageElement.innerText = `${dm.sender}: ${dm.message}`;
                messagesList.appendChild(messageElement);
            });

            threadElement.appendChild(messagesList);
            dmThreads.appendChild(threadElement);
        });
    }
});
