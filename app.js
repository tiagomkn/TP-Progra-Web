function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  const toastBody = document.getElementById('toast-message');

  toastBody.textContent = message;

  // Cambiar color según tipo
  toastEl.classList.remove('bg-success', 'bg-danger');
  if (type === 'danger') {
    toastEl.classList.add('bg-danger');
  } else {
    toastEl.classList.add('bg-success');
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}


(() => {
  // ----- Variables globales -----
  let members = [];

  // ----- Referencias a elementos del DOM -----
  const membersBody = document.getElementById('members-body');
  const rankingBody = document.getElementById('ranking-body');
  const searchInput = document.getElementById('search-input');
  const btnNuevo = document.getElementById('btn-nuevo');

  const formularioSection = document.getElementById('formulario');
  const form = document.getElementById('member-form');
  const formTitle = document.getElementById('form-title');
  const btnCancelar = document.getElementById('btn-cancelar');

  // Campos del formulario
  const inputId = document.getElementById('member-id');
  const inputNombre = document.getElementById('nombre');
  const inputEdad = document.getElementById('edad');
  const inputKm = document.getElementById('km');
  const inputCategoria = document.getElementById('categoria');
  const inputTiempo = document.getElementById('tiempo');
  const inputAvatar = document.getElementById('avatar');

  // ----- Inicialización -----
  function init() {
    // Cargar datos de localStorage si existen
    const stored = localStorage.getItem('club_members');
    members = stored ? JSON.parse(stored) : [];

    // Eventos
    btnNuevo.addEventListener('click', () => openForm());
    btnCancelar.addEventListener('click', closeForm);
    form.addEventListener('submit', onSubmit);
    searchInput.addEventListener('input', renderMembers);

    // Primer render
    renderMembers();
    renderRanking();
  }

  // ----- Funciones de almacenamiento -----
  function saveMembers() {
    localStorage.setItem('club_members', JSON.stringify(members));
  }

  // ----- Renderizado de la tabla de miembros -----
  function renderMembers() {
    const filter = searchInput.value.toLowerCase();
    membersBody.innerHTML = '';

    members
      .filter(m => m.nombre.toLowerCase().includes(filter))
      .forEach(member => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><img src="${member.avatar}" alt="avatar" width="40" height="40"></td>
            <td>${member.nombre}</td>
            <td>${member.edad}</td>
            <td>${member.km}</td>
            <td>${member.categoria}</td>
            <td>${member.tiempo}</td>
            <td>
              <button data-id="${member.id}" class="edit-btn">✏️</button>
              <button data-id="${member.id}" class="delete-btn">❌</button>
            </td>
          `;

        // Eventos de botones
        tr.querySelector('.edit-btn').addEventListener('click', () => openForm(member.id));
        tr.querySelector('.delete-btn').addEventListener('click', () => deleteMember(member.id));

        membersBody.appendChild(tr);
      });
  }

  // ----- Renderizado del ranking -----
  function renderRanking() {
    rankingBody.innerHTML = '';

    // Ordenar por km descendente
    const sorted = [...members].sort((a, b) => b.km - a.km);

    sorted.forEach((member, index) => {
      const tr = document.createElement('tr');
      const place = ["🥇", "🥈", "🥉"][index] || (index + 1);

      tr.innerHTML = `
          <td>${place}</td>
          <td>${member.nombre}</td>
          <td>${member.km}</td>
          <td>${member.categoria}</td>
          <td>${member.tiempo}</td>
        `;

      rankingBody.appendChild(tr);
    });
  }

  // ----- Funciones del formulario -----
  function openForm(id = null) {
    clearForm();
    if (id) {
      formTitle.textContent = 'Editar Corredor';
      const member = members.find(m => m.id === id);
      // Rellenar campos
      inputId.value = member.id;
      inputNombre.value = member.nombre;
      inputEdad.value = member.edad;
      inputKm.value = member.km;
      inputCategoria.value = member.categoria;
      inputTiempo.value = member.tiempo;
      inputAvatar.value = member.avatar;
    } else {
      formTitle.textContent = 'Agregar Corredor';
    }
    formularioSection.hidden = false;
  }

  function closeForm() {
    formularioSection.hidden = true;
  }

  function clearForm() {
    form.reset();
    inputId.value = '';
  }

  function onSubmit(event) {
    event.preventDefault();
    const newMember = {
      id: inputId.value || Date.now().toString(),
      nombre: inputNombre.value,
      edad: parseInt(inputEdad.value),
      km: parseFloat(inputKm.value),
      categoria: inputCategoria.value,
      tiempo: inputTiempo.value,
      avatar: inputAvatar.value || 'https://via.placeholder.com/40'
    };

    if (inputId.value) {
      // Editar existente
      members = members.map(m => m.id === newMember.id ? newMember : m);
      showToast('Corredor actualizado correctamente', 'success');
    } else {
      // Agregar nuevo
      members.push(newMember);
      showToast('Nuevo corredor agregado', 'success');
    }

    saveMembers();
    renderMembers();
    renderRanking();
    closeForm();
  }


  function deleteMember(id) {
    if (confirm('¿Eliminar este corredor?')) {
      members = members.filter(m => m.id !== id);
      saveMembers();
      renderMembers();
      renderRanking();
      showToast('Corredor eliminado correctamente', 'danger');
    }

  }

  // ----- Arrancar la app -----
  init();
})();
