const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('month-year');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');

const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('close-modal');
const eventForm = document.getElementById('event-form');
const eventTitleInput = document.getElementById('event-title');
const eventTimeInput = document.getElementById('event-time');

const exportBtn = document.getElementById('export-events'); 
const importInput = document.getElementById('import-events');
const themeToggle = document.getElementById("theme-toggle");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Світла тема";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "Світла тема";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "Темна тема";
    }
});

exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "events.json";
    a.click();
});

importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        try{
            const imported = JSON.parse(event.target.result);
            for (let key in imported) {
               events[key] = imported[key];
            }
            localStorage.setItem('events', JSON.stringify(events));
            renderEventList(searchInput ? searchInput.value : '');
            alert("Події успішно імпортовано!");
        }
        catch (err){
            alert('Помилка імпорту: Невірний формат файлу.');
        }
    }
})

const holidays = {
     "2025-01-01":  "Новий рік", 
     "2025-01-07":  "Різдво Христове ",
     "2025-01-14":  "Старий Новий рік, Обрізання Господнє, Святого Василія Великого  ",
     "2025-01-19":  "Хрещення Господнє" ,
     "2025-01-22":  "День Соборності України"  ,
     "2025-01-25":  "День студента"
}

let events = JSON.parse(localStorage.getItem('events')) || {};

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень',
        'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    calendarEl.innerHTML = '';

    let emptyDays = (firstDay + 6) % 7
    for (let i = 0; i < emptyDays; i++) {
        const empty = document.createElement('div');
        empty.classList.add('day');
        empty.style.visibility = 'hidden';
        calendarEl.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++){
        const dayEl = document.createElement('div');
        dayEl.classList.add('day');
        dayEl.textContent = day;

        const today = new Date();
        if (day == today.getDate() && month == today.getMonth() && year == today.getFullYear())
        {
            dayEl.classList.add('today');
        }

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (holidays[dateStr]) {
            dayEl.title = holidays[dateStr]; 
            dayEl.classList.add('holiday');
        }

        if (events[dateStr]) {
            dayEl.classList.add('event-day');
            dayEl.title = `${events[dateStr].time} — ${events[dateStr].title}`;
        }

        dayEl.addEventListener("click", (e) => {
            selectedDate = dateStr;
            if (events[dateStr]) {
                eventTitleInput.value = events[dateStr].title || '';
                eventTimeInput.value = events[dateStr].time || '';
            } else {
                eventTitleInput.value = '';
                eventTimeInput.value = '';
            }

            modal.style.display = 'block';
            }
        )

        dayEl.addEventListener('click', () => {
            console.log(`Клікнуто: ${year}-${month + 1}-${day}`);
        });

        calendarEl.appendChild(dayEl);
    }
}

function renderEventList(filter = '') {
    const eventList = document.getElementById('event-list');
    if (!eventList){
        return;
    } 
    eventList.innerHTML = '';
    const today = new Date();

    for (const date in events) {
        const { title, time } = events[date];
        if (title.toLowerCase().includes(filter.toLowerCase())) {
            const li = document.createElement('li');

            const eventDate = new Date(date + 'T' + (time || "00:00"));
            const diffMs = eventDate - today;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let countdown = "";
            if (diffDays > 0) {
                countdown = `(Залишилось ${diffDays} dn${diffDays === 1 ? 'b' : 'i'})`;
            } else if (diffDays === 0) {
                countdown = "(Сьогодні)";
            } else {
                countdown = "(Минуло)";
            }

            li.textContent = `${date} ${time}: ${title}`;
            eventList.appendChild(li);
        }
    }
}

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (selectedDate){
        events[selectedDate] = {
            title: eventTitleInput.value,
            time: eventTimeInput.value
        };
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar(currentDate);
        modal.style.display = 'none';
    }
})

const deleteBtn = document.getElementById('delete-event');
deleteBtn.addEventListener('click', () => {
    if (selectedDate && events[selectedDate]) {
        delete events[selectedDate]; 
        localStorage.setItem('events', JSON.stringify(events)); 
        renderCalendar(currentDate); 
        modal.style.display = 'none'; 
    }
});

const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderEventList(e.target.value);
    });
}

let currentDate = new Date();

renderCalendar(currentDate);
renderEventList();

setInterval(() =>{
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (events[dateStr]){
        const { title, time } = events[dateStr];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (time === currentTime){
            alert(`Нагадування: ${title} о ${time}`);
        }
    }
}, 60000);