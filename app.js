const supabaseUrl = 'https://qslvhtqlpaedbuzxubbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbHZodHFscGFlZGJ1enh1YmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTM5MTMsImV4cCI6MjA3OTIyOTkxM30.TMz__vxDmdd6uj2hxoBYo-bmXcI31e3CVRh0MobWMIo';

const client = supabase.createClient(supabaseUrl, supabaseKey);

const loginOverlay = document.getElementById("loginBox");
const saveNameBtn = document.getElementById("saveName");
const usernameInput = document.getElementById("username");
const logoutBtn = document.getElementById("logoutBtn");
const postText = document.getElementById("postText");
const publishBtn = document.getElementById("publishBtn");
const filterSelect = document.getElementById("filterSelect");
const postsContainer = document.getElementById("postsContainer");
const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");
const editText = document.getElementById("editText");

let posts = [];
let editingId = null;
let deletingId = null;
let username = localStorage.getItem("miniRedUser");

if (username) {
    loginOverlay.style.display = "none";
    logoutBtn.style.display = "block";
} else {
    logoutBtn.style.display = "none";
}

saveNameBtn.addEventListener("click", async () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Escribí tu nombre");

    const originalText = saveNameBtn.innerText;

    saveNameBtn.innerHTML = `<span class="btn-spinner"></span> Guardando...`;
    saveNameBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 2000));

    username = name;
    localStorage.setItem("miniRedUser", name);
    loginOverlay.style.display = "none";
    logoutBtn.style.display = "block";
    fetchPosts();

    saveNameBtn.innerHTML = originalText;
    saveNameBtn.disabled = false;
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("miniRedUser");
    window.location.reload();
});

async function fetchPosts() {
    const { data, error } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error("Error:", error);
    else {
        posts = data;
        renderPosts();
    }
}

function updatePostLikesInDOM(postId, newLikes) {
    const likeBtn = document.querySelector(`.like-btn[data-id="${postId}"]`);
    if (likeBtn) {
        likeBtn.textContent = `👍 ${newLikes}`;
    }
}

client
    .channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
            const updatedPost = payload.new;
            updatePostLikesInDOM(updatedPost.id, updatedPost.likes);
            posts = posts.map(p => p.id === updatedPost.id ? { ...p, likes: updatedPost.likes } : p);
        } else {
            fetchPosts();
        }
    })
    .subscribe();

publishBtn.addEventListener("click", async () => {
    if (!postText.value.trim()) return;
    if (!username) return alert("Usuario no identificado");

    publishBtn.classList.add("loading");

    const insertPromise = client
        .from('posts')
        .insert([{ text: postText.value, author: username, likes: 0 }]);

    const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));

    const [response] = await Promise.all([insertPromise, delayPromise]);
    const { error } = response;

    publishBtn.classList.remove("loading");
    postText.value = "";

    if (error) alert("Error al publicar: " + error.message);
});

function renderPosts() {
    postsContainer.innerHTML = "";
    let ordered = [...posts];

    if (filterSelect.value === "oldest") {
        ordered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (filterSelect.value === "likes") {
        ordered.sort((a, b) => b.likes - a.likes);
    }

    ordered.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        const fecha = new Date(post.created_at).toLocaleString();
        const isMyPost = post.author === username;

        div.innerHTML = `
            <p style="font-size: 0.8rem; color: #7af0ffaa; margin-bottom: 5px;">${fecha}</p>
            <p><strong>${post.author}:</strong> ${post.text}</p>
            <div class="actions">
                <button class="like-btn" data-id="${post.id}">👍 ${post.likes}</button>
                <div>
                    ${isMyPost ? `
                        <button class="edit-btn" data-id="${post.id}">Editar</button>
                        <button class="delete-btn" data-id="${post.id}">Eliminar</button>
                    ` : ''}
                </div>
            </div>
        `;
        postsContainer.appendChild(div);
    });

    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.dataset.id);
            const currentPost = posts.find(p => p.id === id);

            const newLikes = currentPost.likes + 1;
            e.target.textContent = `👍 ${newLikes}`;

            posts = posts.map(p => p.id === id ? { ...p, likes: newLikes } : p);

            await client.from('posts').update({ likes: newLikes }).eq('id', id);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const currentPost = posts.find(p => p.id === id);
            editingId = id;
            editText.value = currentPost.text;
            editModal.classList.remove("hidden");
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deletingId = parseInt(e.target.dataset.id);
            deleteModal.classList.remove("hidden");
        });
    });
}

filterSelect.addEventListener("change", renderPosts);

document.getElementById("saveEdit").addEventListener("click", async () => {
    if (!editText.value.trim()) return;
    await client.from('posts').update({ text: editText.value }).eq('id', editingId);
    editModal.classList.add("hidden");
});
document.getElementById("cancelEdit").addEventListener("click", () => editModal.classList.add("hidden"));

document.getElementById("confirmDelete").addEventListener("click", async () => {
    await client.from('posts').delete().eq('id', deletingId);
    deleteModal.classList.add("hidden");
});
document.getElementById("cancelDelete").addEventListener("click", () => deleteModal.classList.add("hidden"));

fetchPosts();