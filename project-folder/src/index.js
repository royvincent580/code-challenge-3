const baseUrl = 'http://localhost:3000/posts';

const postListUl = document.getElementById('post-list');
const postCountSpan = document.getElementById('post-count');
const postDetailDiv = document.getElementById('post-detail');
const newPostForm = document.getElementById('new-post-form');

const editPostCard = document.getElementById('edit-post-card');
const editPostForm = document.getElementById('edit-post-form');
const editTitleInput = document.getElementById('edit-title');
const editContentTextarea = document.getElementById('edit-content');
const cancelEditBtn = document.getElementById('cancel-edit');

let currentPostId = null;

function createPostListItem(post) {
    console.log('Creating list item for post:', post.title);
    const listItem = document.createElement('li');
    listItem.classList.add('blog-post-item');
    listItem.dataset.id = post.id;

    const titleElement = document.createElement('span');
    titleElement.classList.add('post-list-item-title');
    titleElement.textContent = post.title;

    const metaElement = document.createElement('div');
    metaElement.classList.add('post-list-item-meta');
    metaElement.innerHTML = `By ${post.author} • ${post.date}`;

    listItem.append(titleElement, metaElement);

    listItem.addEventListener('click', () => {
        console.log(`List item clicked for post ID: ${post.id}`);
        handlePostClick(post.id);
    });

    return listItem;
}

function displayPosts() {
    console.log('Attempting to display all posts...');
    postListUl.innerHTML = '<li class="loading-message">Loading posts...</li>';

    fetch(baseUrl) 
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            console.log('Posts fetched successfully:', posts);

            posts.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
            console.log('Posts sorted by date (newest first):', posts);

            postCountSpan.textContent = `${posts.length} posts`;
            console.log('Total posts count:', posts.length);
            postListUl.innerHTML = '';

            posts.forEach(post => {
                const listItem = createPostListItem(post);
                postListUl.appendChild(listItem);
            });

            if (posts.length > 0) {
                console.log(`Displaying details for the first post (ID: ${posts[0].id})`);
                handlePostClick(posts[0].id);
            } else {
                console.log('No posts found. Displaying "Nothing Selected" message.');
                postDetailDiv.innerHTML = `
                    <h2 class="post-detail-title">Nothing Selected</h2>
                    <div class="post-info">
                        <span class="post-author"></span>
                        <span class="post-date"></span>
                    </div>
                    <div class="post-detail-image-container">
                        <img src="" alt="Post Image" class="post-detail-image hidden">
                    </div>
                    <p class="post-content">Click a blog post from the left to see its full details.</p>
                `;
                document.getElementById('edit-post-btn').classList.add('hidden');
                document.getElementById('delete-post-btn').classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            postListUl.innerHTML = '<li class="loading-message error-message">Failed to load posts.</li>';
            postCountSpan.textContent = '0 posts';
        });
}

function handlePostClick(postId) {
    console.log(`Handling click for post ID: ${postId}`);
    currentPostId = postId;
    editPostCard.classList.add('hidden');

    postDetailDiv.innerHTML = `
        <h2 class="post-detail-title">Loading...</h2>
        <div class="post-info"></div>
        <div class="post-detail-image-container"></div>
        <p class="post-content">Fetching post details...</p>
        <div class="post-actions">
            <button id="edit-post-btn" class="action-btn edit-btn hidden">Edit</button>
            <button id="delete-post-btn" class="action-btn delete-btn hidden">Delete</button>
        </div>
    `;

    Array.from(postListUl.children).forEach(item => {
        item.classList.remove('active');
    });
    const clickedItem = document.querySelector(`.blog-post-item[data-id="${postId}"]`);
    if (clickedItem) {
        clickedItem.classList.add('active');
        console.log(`Active class added to list item for post ID: ${postId}`);
    }

    fetch(`${baseUrl}/${postId}`) // GET request for single post
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(post => {
            console.log('Detailed post fetched:', post);
            const imageSrc = post.avatar || '';

            postDetailDiv.innerHTML = `
                <h2 class="post-detail-title">${post.title}</h2>
                <div class="post-info">
                    <span class="post-author">By ${post.author}</span>
                    <span class="post-date">• ${post.date}</span>
                </div>
                <div class="post-detail-image-container">
                     <img src="${imageSrc}" alt="${post.title}" class="post-detail-image ${imageSrc ? '' : 'hidden'}">
                </div>
                <p class="post-content">${post.content.replace(/\n/g, '<br>')}</p>
                <div class="post-actions">
                    <button id="edit-post-btn" class="action-btn edit-btn">Edit</button>
                    <button id="delete-post-btn" class="action-btn delete-btn">Delete</button>
                </div>
            `;
            console.log(`Post detail rendered for: ${post.title}`);

            document.getElementById('edit-post-btn').addEventListener('click', () => {
                console.log('Edit button clicked for post ID:', post.id);
                showEditForm(post);
            });
            document.getElementById('delete-post-btn').addEventListener('click', () => {
                console.log('Delete button clicked for post ID:', post.id);
                deletePost(post.id);
            });
        })
        .catch(error => {
            console.error(`Error fetching post ${postId}:`, error);
            postDetailDiv.innerHTML = `
                <h2 class="post-detail-title">Error</h2>
                <p class="post-content error-message">Failed to load post details. Please try again.</p>
            `;
        });
}

function addNewPostListener() {
    console.log('New post form listener initialized.');
    newPostForm.addEventListener('submit', (event) => { 
        event.preventDefault();
        console.log('New post form submitted.');

        const title = document.getElementById('new-title').value;
        const author = document.getElementById('new-author').value;
        const avatar = document.getElementById('new-avatar').value;
        const content = document.getElementById('new-content').value;
        const date = new Date().toISOString().split('T')[0];

        const newPost = {
            title,
            content,
            author,
            avatar: avatar || null,
            date
        };
        console.log('New post data to be sent:', newPost);

        fetch(baseUrl, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(addedPost => {
            console.log('Post added successfully:', addedPost);
            displayPosts();
            handlePostClick(addedPost.id);
            newPostForm.reset();
            console.log('New post form reset.');
        })
        .catch(error => {
            console.error('Error adding new post:', error);
            alert('Failed to add new post. Please try again.');
        });
    });
}

function showEditForm(post) {
    console.log('Showing edit form for post:', post.id);
    editPostCard.classList.remove('hidden');
    editTitleInput.value = post.title;
    editContentTextarea.value = post.content;
    currentPostId = post.id;
    console.log('Edit form pre-filled with data for post ID:', currentPostId);
}

editPostForm.addEventListener('submit', (event) => { 
    event.preventDefault();
    console.log('Edit post form submitted for post ID:', currentPostId);

    const updatedTitle = editTitleInput.value;
    const updatedContent = editContentTextarea.value;

    const updatedPostData = {
        title: updatedTitle,
        content: updatedContent
    };
    console.log('Updated post data to be sent:', updatedPostData);

    fetch(`${baseUrl}/${currentPostId}`, { 
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPostData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(patchedPost => {
        console.log('Post updated successfully:', patchedPost);
        handlePostClick(patchedPost.id);
        displayPosts();
        editPostCard.classList.add('hidden');
        editPostForm.reset();
        console.log('Edit form hidden and reset.');
    })
    .catch(error => {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');
    });
});

cancelEditBtn.addEventListener('click', () => {
    console.log('Edit form cancel button clicked.');
    editPostCard.classList.add('hidden');
    editPostForm.reset();
});

function deletePost(postId) { 
    console.log('Attempting to delete post ID:', postId);
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        console.log('Delete operation cancelled by user.');
        return;
    }

    fetch(`${baseUrl}/${postId}`, { 
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Post deleted successfully:', postId);
        postDetailDiv.innerHTML = `
            <h2 class="post-detail-title">Post Deleted</h2>
            <p class="post-content">The post has been removed. Select another post or add a new one.</p>
        `;
        editPostCard.classList.add('hidden');
        displayPosts();
        console.log('Post deleted from UI and list refreshed.');
    })
    .catch(error => {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
    });
}

function main() {
    console.log('Application main function started.');
    displayPosts();
    addNewPostListener();
}

document.addEventListener('DOMContentLoaded', main);
console.log('DOM Content Loaded event listener registered.');