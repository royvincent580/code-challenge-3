
const baseUrl = 'http://localhost:5000/posts';

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
        handlePostClick(post.id);
    });

    return listItem;
}

function displayPosts() {
    postListUl.innerHTML = '<li class="loading-message">Loading posts...</li>';

    fetch(baseUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            postCountSpan.textContent = `${posts.length} posts`;
            postListUl.innerHTML = '';

            posts.forEach(post => {
                const listItem = createPostListItem(post);
                postListUl.appendChild(listItem);
            });

            if (posts.length > 0) {
                handlePostClick(posts[0].id);
            } else {
                postDetailDiv.innerHTML = `
                    <h2 class="post-detail-title">Nothing Selected</h2>
                    <div class="post-info"></div>
                    <div class="post-detail-image-container"><img src="" alt="Post Image" class="post-detail-image hidden"></div>
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

    Array.from(postListUl.children).forEach(item => item.classList.remove('active'));
    const clickedItem = document.querySelector(`.blog-post-item[data-id="${postId}"]`);
    if (clickedItem) clickedItem.classList.add('active');

    fetch(`${baseUrl}/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(post => {
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

            document.getElementById('edit-post-btn').addEventListener('click', () => showEditForm(post));
            document.getElementById('delete-post-btn').addEventListener('click', () => deletePost(post.id));
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
    newPostForm.addEventListener('submit', (event) => {
        event.preventDefault();

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

        fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost),
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(addedPost => {
            displayPosts();
            handlePostClick(addedPost.id);
            newPostForm.reset();
        })
        .catch(error => {
            console.error('Error adding new post:', error);
            alert('Failed to add new post. Please try again.');
        });
    });
}

function showEditForm(post) {
    editPostCard.classList.remove('hidden');
    editTitleInput.value = post.title;
    editContentTextarea.value = post.content;
    currentPostId = post.id;
}

editPostForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const updatedPostData = {
        title: editTitleInput.value,
        content: editContentTextarea.value
    };

    fetch(`${baseUrl}/${currentPostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPostData),
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(patchedPost => {
        handlePostClick(patchedPost.id);
        displayPosts();
        editPostCard.classList.add('hidden');
        editPostForm.reset();
    })
    .catch(error => {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');
    });
});

cancelEditBtn.addEventListener('click', () => {
    editPostCard.classList.add('hidden');
    editPostForm.reset();
});

function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

    fetch(`${baseUrl}/${postId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            postDetailDiv.innerHTML = `
                <h2 class="post-detail-title">Post Deleted</h2>
                <p class="post-content">The post has been removed. Select another post or add a new one.</p>
            `;
            editPostCard.classList.add('hidden');
            displayPosts();
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        });
}

function main() {
    displayPosts();
    addNewPostListener();
}

document.addEventListener('DOMContentLoaded', main);
