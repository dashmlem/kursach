document.addEventListener("DOMContentLoaded", () => {
    const campaignsList = document.getElementById("campaignsList");
    const postsList = document.getElementById("postsList");
    const campaignSelect = document.getElementById("campaignSelect");
    const analyticsResult = document.getElementById("analyticsResult");
    const pagination = document.getElementById("pagination");
    const searchInput = document.getElementById("searchInput");

    let currentPage = 1;
    const postsPerPage = 5;
    let allPosts = [];

    // Загрузка кампаний
    async function loadCampaigns() {
        const response = await fetch("/api/campaigns");
        const campaigns = await response.json();

        campaignsList.innerHTML = "";
        campaignSelect.innerHTML = "<option value=''>Выберите кампанию</option>";
        campaigns.forEach((campaign) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item", "d-flex", "justify-content-between");
            li.innerHTML = `
                <span>${campaign.name} - Бюджет: ${campaign.budget} руб.</span>
                <button class="btn btn-danger btn-sm" data-id="${campaign.id}">Удалить</button>
            `;
            li.querySelector("button").addEventListener("click", () => deleteCampaign(campaign.id));
            campaignsList.appendChild(li);

            const option = document.createElement("option");
            option.value = campaign.id;
            option.textContent = campaign.name;
            campaignSelect.appendChild(option);
        });
    }

    // Создание кампании
    document.getElementById("addCampaignBtn").addEventListener("click", async () => {
        const name = prompt("Введите название кампании:");
        const budget = prompt("Введите бюджет кампании (число):");
    
        if (!name || name.trim() === "") {
            alert("Название кампании не может быть пустым!");
            return;
        }
    
        if (!budget || isNaN(budget) || budget <= 0) {
            alert("Бюджет должен быть положительным числом!");
            return;
        }
    
        await fetch("/api/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, budget }),
        });
    
        loadCampaigns();
    });

    // Удаление кампании
    async function deleteCampaign(id) {
        // Удаляем кампанию с сервера
        await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
        
        // Перезагружаем список кампаний
        loadCampaigns();
    
        // Перезагружаем список постов, чтобы они обновились без удаленной кампании
        loadPosts(currentPage); // Возвращаемся на текущую страницу постов
    }

    // Загрузка постов с пагинацией
    async function loadPosts(page = 1) {
        currentPage = page;
        const response = await fetch("/social-api/posts");
        allPosts = await response.json();
        renderPosts();
        renderPagination();
    }

    // Отображение постов на текущей странице
    function renderPosts() {
        postsList.innerHTML = "";
    
        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        const filteredPosts = allPosts.slice(start, end);
    
        filteredPosts.forEach((post) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.innerHTML = `${post.platform}: ${post.content} (Запланировано на: ${new Date(
                post.scheduled_time
            ).toLocaleString()})`;
            postsList.appendChild(li);
        });
    }

    // Отображение кнопок пагинации
    function renderPagination() {
        const totalPages = Math.ceil(allPosts.length / postsPerPage);
        pagination.innerHTML = ""; // Очистка старых элементов
    
        if (totalPages <= 1) {
            // Если страниц меньше или равно 1, скрываем пагинацию
            pagination.style.display = "none";
            return;
        }
    
        pagination.style.display = "flex"; // Показываем пагинацию, если страниц больше одной
    
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            // Убедимся, что классы корректно задаются
            if (i === currentPage) {
                li.classList.add("page-item", "active");
            } else {
                li.classList.add("page-item");
            }
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault(); // Предотвращаем перезагрузку страницы
                loadPosts(i);
            });
            pagination.appendChild(li);
        }
    }
    

    // Реализация поиска
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
    
        // Фильтрация постов на основе запроса
        const filtered = allPosts.filter((post) =>
            post.platform.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
        );
    
        // Отображаем посты в соответствии с фильтром
        postsList.innerHTML = "";
        filtered.forEach((post) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.innerHTML = `${post.platform}: ${post.content} (Запланировано на: ${new Date(post.scheduled_time).toLocaleString()})`;
            postsList.appendChild(li);
        });
    
        // Управление отображением пагинации
        if (filtered.length === 0 || query !== "") {
            // Если нет результатов поиска или поиск активен, скрываем пагинацию
            pagination.style.display = "none";
            postsList.style.maxHeight = "none";  // Сбрасываем высоту контейнера, чтобы не было скроллинга
        } else {
            // Если поле поиска пустое, показываем пагинацию и обновляем высоту контейнера
            pagination.style.display = "flex";
            postsList.style.maxHeight = "500px";  // Например, устанавливаем максимальную высоту контейнера, если пагинация отображается
            renderPagination();  // Отображаем пагинацию для всех постов
        }
    
        // Если запрос пустой, обновляем отображение всех постов
        if (query === "") {
            loadPosts(currentPage);
            renderPagination();
        }
    });

    // Создание поста
    document.getElementById("createPostForm").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const campaign_id = campaignSelect.value;
        const platform = document.getElementById("platform").value.trim();
        const content = document.getElementById("content").value.trim();
        const scheduled_time = document.getElementById("scheduledTime").value;
    
        if (!campaign_id) {
            alert("Пожалуйста, выберите кампанию!");
            return;
        }
    
        if (!platform) {
            alert("Платформа не может быть пустой!");
            return;
        }
    
        if (!content) {
            alert("Контент поста не может быть пустым!");
            return;
        }
    
        if (!scheduled_time || isNaN(new Date(scheduled_time).getTime())) {
            alert("Укажите корректное время публикации!");
            return;
        }
    
        await fetch("/social-api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campaign_id, platform, content, scheduled_time }),
        });
    
        loadPosts();
    });

    // Загрузка аналитики
    document.getElementById("analyticsSummaryBtn").addEventListener("click", async () => {
        const response = await fetch("/analytics/summary");
        const summary = await response.json();
        analyticsResult.textContent = JSON.stringify(summary, null, 2);
    });

    // Инициализация
    loadCampaigns();
    loadPosts();
});