// Tu función showToast
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  const toastBody = document.getElementById('toast-message');
  const currentToast = bootstrap.Toast.getInstance(toastEl);

  if (currentToast) {
    currentToast.dispose();
  }

  toastBody.textContent = message;

  const bgClasses = ['text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info'];
  toastEl.classList.remove(...bgClasses); // Quitar clases de color previas

  let toastClass = 'text-bg-success'; // Default
  if (type === 'danger') toastClass = 'text-bg-danger';
  else if (type === 'warning') toastClass = 'text-bg-warning';
  else if (type === 'info') toastClass = 'text-bg-info';
  
  toastEl.classList.add(toastClass);

  const newToast = new bootstrap.Toast(toastEl, { delay: 3500 });
  newToast.show();
}


(() => {
  let members = [];

  const membersBody = document.getElementById('members-body');
  const rankingBody = document.getElementById('ranking-body'); // Referencia al tbody del ranking
  const searchInput = document.getElementById('search-input');
  const btnNuevo = document.getElementById('btn-nuevo');

  const formularioSection = document.getElementById('formulario-seccion'); // ID de sección actualizado
  const form = document.getElementById('member-form');
  const formTitle = document.getElementById('form-title');
  const btnCancelar = document.getElementById('btn-cancelar');

  const inputId = document.getElementById('member-id');
  const inputNombre = document.getElementById('nombre');
  const inputEdad = document.getElementById('edad');
  const inputKm = document.getElementById('km');
  const inputCategoria = document.getElementById('categoria');
  const inputTiempo = document.getElementById('tiempo');
  const inputAvatar = document.getElementById('avatar');

  function init() {
    const stored = localStorage.getItem('club_members');
    if (stored) {
        try {
            members = JSON.parse(stored);
        } catch (e) {
            console.error("Error al parsear miembros desde localStorage:", e);
            members = [];
            // localStorage.removeItem('club_members'); // Opcional: limpiar si está corrupto
        }
    } else {
        members = [];
    }
    
    if (btnNuevo) btnNuevo.addEventListener('click', () => openForm());
    if (btnCancelar) btnCancelar.addEventListener('click', closeForm);
    if (form) form.addEventListener('submit', onSubmit);
    if (searchInput) searchInput.addEventListener('input', renderMembers);

    renderMembers();
    renderRanking(); // Renderizar el ranking al iniciar
  }

  function saveMembers() {
    localStorage.setItem('club_members', JSON.stringify(members));
  }

  function renderMembers() {
    if (!membersBody) return;
    const filterText = searchInput ? searchInput.value.toLowerCase() : "";
    membersBody.innerHTML = '';

    const filteredMembers = members.filter(m => 
        m.nombre && m.nombre.toLowerCase().includes(filterText)
    );

    if (filteredMembers.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="7" class="text-center fst-italic py-3">No hay miembros para mostrar ${filterText ? 'con el filtro actual' : ''}.</td>`;
        membersBody.appendChild(tr);
        return;
    }

    filteredMembers.forEach(member => {
        const tr = document.createElement('tr');
        const avatarSrc = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nombre || 'S A')}&background=00ff88&color=121212&size=40&bold=true&format=svg`;
        
        tr.innerHTML = `
            <td><img src="${avatarSrc}" alt="${member.nombre || 'Avatar'}" class="member-avatar"></td>
            <td>${member.nombre || 'N/A'}</td>
            <td>${member.edad || 'N/A'}</td>
            <td>${member.km !== undefined ? member.km + ' km' : 'N/A'}</td>
            <td>${member.categoria || 'N/A'}</td>
            <td>${member.tiempo || 'N/A'}</td>
            <td>
              <button data-id="${member.id}" class="btn btn-sm btn-outline-primary edit-btn me-1" title="Editar">✏️</button>
              <button data-id="${member.id}" class="btn btn-sm btn-outline-danger delete-btn" title="Eliminar">❌</button>
            </td>
          `;
        const editBtn = tr.querySelector('.edit-btn');
        const deleteBtn = tr.querySelector('.delete-btn');
        if (editBtn) editBtn.addEventListener('click', () => openForm(member.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteMember(member.id));
        
        membersBody.appendChild(tr);
      });
  }

  // ----- Renderizado del ranking -----
  function renderRanking() {
    if (!rankingBody) return;
    rankingBody.innerHTML = '';

    if (members.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" class="text-center fst-italic py-3">Aún no hay corredores para mostrar en el ranking.</td>`;
        rankingBody.appendChild(tr);
        return;
    }

    const sortedMembers = [...members]
        .map(m => ({ ...m, km: parseFloat(m.km) || 0 }))
        .sort((a, b) => b.km - a.km);

    sortedMembers.forEach((member, index) => {
      const tr = document.createElement('tr');
      let place;
      if (index === 0) place = "🥇";
      else if (index === 1) place = "🥈";
      else if (index === 2) place = "🥉";
      else place = `<span class="fw-normal">${index + 1}</span>`;

      tr.innerHTML = `
          <td class="fw-bold text-center">${place}</td>
          <td>${member.nombre || 'N/A'}</td>
          <td>${member.km !== undefined ? member.km + ' km' : 'N/A'}</td>
          <td>${member.categoria || 'N/A'}</td>
          <td>${member.tiempo || 'N/A'}</td>
        `;
      rankingBody.appendChild(tr);
    });
  }

  function openForm(id = null) {
    if (!form) return;
    clearForm();
    if (id) {
      if (formTitle) formTitle.textContent = 'Editar Corredor';
      const member = members.find(m => m.id === id);
      if (member) {
        if (inputId) inputId.value = member.id;
        if (inputNombre) inputNombre.value = member.nombre;
        if (inputEdad) inputEdad.value = member.edad;
        if (inputKm) inputKm.value = member.km;
        if (inputCategoria) inputCategoria.value = member.categoria;
        if (inputTiempo) inputTiempo.value = member.tiempo;
        if (inputAvatar) inputAvatar.value = member.avatar;
      } else {
        showToast(`Error: No se encontró el miembro para editar.`, 'danger');
        return;
      }
    } else {
      if (formTitle) formTitle.textContent = 'Agregar Corredor';
    }
    if (formularioSection) {
        formularioSection.hidden = false;
        formularioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function closeForm() {
    if (formularioSection) formularioSection.hidden = true;
    clearForm();
  }

  function clearForm() {
    if (form) form.reset();
    if (inputId) inputId.value = '';
  }

  function onSubmit(event) {
    event.preventDefault();
    const memberData = {
      id: inputId.value || Date.now().toString(),
      nombre: inputNombre.value.trim(),
      edad: parseInt(inputEdad.value),
      km: parseFloat(inputKm.value),
      categoria: inputCategoria.value,
      tiempo: inputTiempo.value.trim(),
      avatar: inputAvatar.value.trim()
    };

    if (!memberData.nombre) {
        showToast('El nombre es obligatorio.', 'warning');
        if (inputNombre) inputNombre.focus();
        return;
    }
    if (isNaN(memberData.edad) || memberData.edad <= 0) {
        showToast('Ingresa una edad válida.', 'warning');
        if (inputEdad) inputEdad.focus();
        return;
    }
    if (isNaN(memberData.km) || memberData.km < 0) {
        showToast('Ingresa kilómetros válidos (0 o más).', 'warning');
        if (inputKm) inputKm.focus();
        return;
    }
    
    if (inputId.value) {
      members = members.map(m => m.id === memberData.id ? memberData : m);
      showToast('Corredor actualizado.', 'success');
    } else {
      members.push(memberData);
      showToast('Nuevo corredor agregado.', 'success');
    }

    saveMembers();
    renderMembers();
    renderRanking(); // Actualizar ranking
    closeForm();
  }

  function deleteMember(id) {
    if (confirm('¿Eliminar este corredor?')) {
      members = members.filter(m => m.id !== id);
      saveMembers();
      renderMembers();
      renderRanking(); // Actualizar ranking
      showToast('Corredor eliminado.', 'info');
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    init();

    // Smooth scroll para enlaces del navbar con offset
    const navLinks = document.querySelectorAll('.custom-navbar .nav-link[href^="#"]');
    const navbarElement = document.querySelector('.custom-navbar');
    const navbarHeight = navbarElement ? navbarElement.offsetHeight : 70; // Fallback

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
            
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Cerrar menú colapsado en móviles
                const navbarCollapse = document.getElementById('navbarNavClub');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const toggler = document.querySelector('.navbar-toggler[data-bs-target="#navbarNavClub"]');
                    if (toggler) {
                        // Bootstrap 5.3 usa new bootstrap.Collapse(navbarCollapse).hide() o toggler.click()
                        // toggler.click() es más simple si no tienes la instancia de Collapse
                        toggler.click();
                    }
                }
            }
        });
    });
  });

})();