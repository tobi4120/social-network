document.addEventListener('DOMContentLoaded', function() {

    // Hide danger alert by default
    document.querySelector(".alert-danger").style.display = "none";

    // Close alert function
    document.querySelector(".close").addEventListener("click", function(event) {
        document.querySelector(".alert-danger").style.display = "none";
    });

    // Load all the posts for page 1
    all_posts(1);
    
    // New post
    document.getElementById("submit_new_post").onclick = function(event) {

        // Prevent submit from refreshing the page
        event.preventDefault();
        
        // Run the send new post function
        new_post();
        
        // Clear the contents of the textarea
        document.getElementById("new_post_content").value = "";
    }
});

// New post function
function new_post() {
    let csrftoken = document.getElementById("csrf_token").value 
    let content = document.getElementById("new_post_content").value

    // If post content is blank display error message
    if (content == "") {
        document.querySelector(".alert-danger").style.display = "block";
    }

    // Add new post to the database
    fetch('/apiposts/', {
        method: 'POST',
        body: JSON.stringify({
            content: content,
            likes: 0,
        }),
        headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/JSON" }
    })
    .then(() => {
        
        // Re-load posts
        all_posts(1);
    });
}

// Load all posts function
function all_posts(current_page) {
    fetch(`/apiposts/`)
  .then(response => response.json())
  .then(posts => { 
      
        // Pagination
        current_page --;

        let start = 10 * current_page;
        let end = 10 + start;
        let page_posts = posts.slice(start, end)
        
        document.getElementById("all_posts").innerHTML = "" 

        // Display posts
        page_posts.forEach(function(post) {

            const months = ["January", "Febuary", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];

            var creation_date = new Date(post.creation_date)

            document.getElementById("all_posts").innerHTML += 
            `<div id=${post.id} class='post'>
                <h5><a class="post_user" href="/profile/${post.user}"><strong>${post.user}</strong></a></h5>
                <div id=content_${post.id}>${post.content}</div>
                <p class='creation_date'>${months[creation_date.getMonth()]} ${creation_date.getDate()}, 
                ${creation_date.getFullYear()}, ${format_time()}</p>
                <div id='likes_${post.id}' class="likes"><p id='like_count_${post.id}' class='like_count'>${post.likes}</p></div>
            </div>`;

            function format_time() {
                var hours = creation_date.getHours();
                var minutes = creation_date.getMinutes();
                var ampm = hours >= 12 ? 'p.m.' : 'a.m.';
                hours = hours % 12;
                hours = hours ? hours : 12; 
                minutes = minutes < 10 ? '0'+ minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                return strTime;
            }

            // Edit post button__________________________________________________
            if (post.user == current_user) {
                const edit_post_button = document.createElement("a");
                edit_post_button.innerHTML = "Edit";
                edit_post_button.setAttribute("id", `edit_post_${post.id}`);
                edit_post_button.setAttribute("class", "edit_post")
                edit_post_button.setAttribute("data-post_id", post.id)
                edit_post_button.setAttribute("data-on_page", current_page)
                edit_post_button.style.color = '#047bfe';

                document.getElementById(post.id).append(edit_post_button);
            }

            // Like button__________________________________________________

            // Determine if the user has already liked the post
            var current_user_liked_post = false;

            fetch('apilikes/')
            .then(response => response.json())
            .then(likes => {

                likes.forEach(function(like) {
                    if (like.account == current_user && like.post == post.id ) {
                        current_user_liked_post = true
                    }
                });

                // Create like button
                if (current_user) {
                    if (current_user_liked_post == false) {
                        const like_button = document.createElement("span");
                        like_button.innerHTML = '<i class="far fa-heart"></i>'
                        like_button.setAttribute("id", `like_button_${post.id}`)
                        like_button.setAttribute("class", "like_post")
                        like_button.setAttribute("data-post_id", post.id)
                        like_button.setAttribute("data-on_page", current_page)

                        document.getElementById(`likes_${post.id}`).append(like_button);
                        document.getElementById(`likes_${post.id}`).insertBefore(like_button, document.getElementById(`like_count_${post.id}`));
                    
                    // Create unlike button
                    } else {
                        const unlike_button = document.createElement("span");
                        unlike_button.innerHTML = '<i class="fas fa-heart"></i>';
                        unlike_button.setAttribute("id", `unlike_button_${post.id}`)
                        unlike_button.setAttribute("class", "unlike_post")
                        unlike_button.setAttribute("data-post_id", post.id)
                        unlike_button.setAttribute("data-on_page", current_page)

                        document.getElementById(`likes_${post.id}`).append(unlike_button);
                        document.getElementById(`likes_${post.id}`).insertBefore(unlike_button, document.getElementById(`like_count_${post.id}`));
                    }
                }
            });
        });
        
        // Recalibrate page
        current_page++
    
    // Pagination buttons________________________________________________
    document.getElementById("previous_button").innerHTML = ""
    document.getElementById("next_button").innerHTML = ""

    // Previous button

        // Create the button
        const previous_page_button = document.createElement("button");
        previous_page_button.innerHTML = "Previous";
        previous_page_button.setAttribute("id", "previous_page_button");
        previous_page_button.setAttribute("class", "page-link")

        // Add event listener
        previous_page_button.addEventListener('click', function() {
            current_page--

            // Re-load posts for the selected page
            all_posts(current_page)
        })

        // Append to div
        document.getElementById("previous_button").append(previous_page_button);
    
    // Enable/disable previous button
    if (current_page === 1) {
        previous_page_button.disabled = true
        previous_page_button.setAttribute('class', 'disabled-button')
    }

    // Next button

        // Create the button
        const next_page_button = document.createElement("button");
        next_page_button.innerHTML = "Next";
        next_page_button.setAttribute("id", "next_page_button")
        next_page_button.setAttribute("class", "page-link")

        // Add event listener
        next_page_button.addEventListener('click', function() {
            current_page++

            // Re-load posts for the selected page
            all_posts(current_page)
        })
        
        // Append to div
        document.getElementById("next_button").append(next_page_button);
    
    // Enable/disable next button
    if (current_page >= posts.length/10) {
        next_page_button.disabled = true
        next_page_button.setAttribute('class', 'disabled-button')
    }

    // Buttons for each page
    document.getElementById("pages").innerHTML = ""

    for (i=0; i < posts.length/10; i++) {
        
        // Create the button
        const page_button = document.createElement("button");
        page_button.innerHTML = i+1;
        page_button.setAttribute("id", `page_${i+1}`)
        page_button.setAttribute("data-number", i+1)
        page_button.setAttribute("class", "page-link")
    
        // Change color of button to indicate what the current page is
        if (current_page == page_button.dataset.number) {
            page_button.setAttribute('class', 'page-link active')
        }

        // Add event listener
        page_button.addEventListener('click', function() {
            
            // Get the page 
            all_posts(this.dataset.number)
        })
        
        // Append to div
        document.getElementById("pages").append(page_button);
    }
  });
}

// Event listener for entire page_______________________________________
document.addEventListener('click', function(event) {

    // Edit post event_________________________________________________
    if (event.target.matches('.edit_post')) {
        post_id = event.target.dataset.post_id; 

        content = document.getElementById(`content_${post_id}`);
        
        content.innerHTML = `<textarea id='edited_content'>${content.innerHTML}</textarea>`;

        current_page = parseInt(event.target.dataset.on_page) + 1

        // Remove edit button
        document.getElementById(event.target.id).remove();

        // Add save button
        save_button = document.createElement("a");
        save_button.setAttribute("class", "save_post")
        save_button.innerHTML = "Save";
        save_button.style.color = '#047bfe';

        let csrftoken = document.getElementById("csrf_token").value;

        save_button.addEventListener('click', function(event) {

            // Update post content 
            fetch(`/apiposts/${post_id}/`, {
                method: 'PUT',
                body: JSON.stringify({
                    content: document.getElementById('edited_content').value
                }),
                headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/JSON" }
            })
            .then(() => {
        
                // Re-load posts
                all_posts(current_page)
            });
        });

        document.getElementById(post_id).append(save_button);
    
    // Like post event____________________________________________
    } else if (event.target.parentNode.matches('.like_post')) {

        //  CSRF Token
        csrftoken = document.getElementById("csrf_token").value;

        // Get post id
        post_id = event.target.parentNode.dataset.post_id

        // POST Request to add like to database
        fetch('/apilikes/', {
            method: 'POST',
            body: JSON.stringify({
                post: post_id
            }),
            headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/JSON" }
        })
        .then(() => {
            // Get post content (need to PUT content since it is a non null field) and current amount of likes
            fetch(`apiposts/${post_id}`)
            .then(response => response.json())
            .then(post => {

                content = post.content
                likes = (parseInt(post.likes) + 1)

                // Update like count
                fetch(`/apiposts/${post_id}/`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        content: content,
                        likes: likes
                    }),
                    headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/JSON" }
                })
                .then(() => {
        
                    // Re-load posts
                    current_page = parseInt(event.target.parentNode.dataset.on_page) 

                    all_posts(current_page)
                });
            });
        });

    // Unlike post event________________________________________________
    } else if (event.target.parentNode.matches('.unlike_post')) {

        let post_id = event.target.parentNode.dataset.post_id
        csrftoken = document.getElementById("csrf_token").value

        // Delete the like from the database
        fetch('/apilikes/')
        .then(response => response.json())
        .then(likes => {
            
            likes.forEach(function(like) { 
                if (like.account == current_user && like.post == post_id) {
                    fetch(`/apilikes/${like.id}`, {
                        method: 'DELETE',
                        headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/JSON" }
                    })
                    .then(() => {
                        // Get post content (need to PUT content since it is a non null field) and current amount of likes
                        fetch(`apiposts/${post_id}`)
                        .then(response => response.json())
                        .then(post => {

                            content = post.content
                            likes = (parseInt(post.likes) - 1)

                            // Update like count
                            fetch(`/apiposts/${post_id}/`, {
                                method: 'PUT',
                                body: JSON.stringify({
                                    content: content,
                                    likes: likes
                                }),
                                headers: { "X-CSRFToken": csrftoken, "Content-Type": "application/JSON" }
                            })
                            .then(() => {
                                // Re-load posts
                                current_page = parseInt(event.target.parentNode.dataset.on_page) 
                                all_posts(current_page)
                            })
                        });
                    })
                }
            })
        });
    }
});
