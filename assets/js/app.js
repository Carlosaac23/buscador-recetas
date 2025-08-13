function iniciarApp() {
  const selectCategorias = document.getElementById('categorias');
  selectCategorias.addEventListener('change', seleccionarCategoria);

  const resultadoRecetas = document.getElementById('resultado');
  const modal = new bootstrap.Modal('#modal', {});

  obtenerCategorias();

  function obtenerCategorias() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    fetch(url)
      .then(res => res.json())
      .then(data => mostrarCategorias(data.categories))
      .catch(error => console.error('Error fetching categories:', error));
  }

  function mostrarCategorias(categorias = []) {
    categorias.forEach(categoria => {
      const { strCategory } = categoria;
      const option = document.createElement('option');
      option.value = strCategory;
      option.textContent = strCategory;
      selectCategorias.appendChild(option);
    });
  }

  function seleccionarCategoria(e) {
    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
    fetch(url)
      .then(res => res.json())
      .then(data => mostrarRecetas(data.meals))
      .catch(error => console.error('Error fetching categories:', error));
  }

  function mostrarRecetas(recetas = []) {
    limpiarHTML(resultadoRecetas);

    const heading = document.createElement('h2');
    heading.classList.add('text-center', 'text-black', 'my-5');
    heading.textContent = recetas.length ? 'Resultados' : 'No hay resultados';
    resultadoRecetas.appendChild(heading);

    recetas.forEach(receta => {
      const { idMeal, strMeal, strMealThumb } = receta;

      const recetaContenedor = document.createElement('div');
      recetaContenedor.classList.add('col-md-4');

      const recetaCard = document.createElement('div');
      recetaCard.classList.add('card', 'mb-4');

      const recetaImagen = document.createElement('img');
      recetaImagen.classList.add('card-img-top');
      recetaImagen.alt = `Imagen de la receta ${strMeal}` || 'Imagen de la receta';
      recetaImagen.src = strMealThumb;

      const recetaCardBody = document.createElement('body');
      recetaCardBody.classList.add('card-body');

      const recetaHeading = document.createElement('h3');
      recetaHeading.classList.add('card-title', 'mb-3');
      recetaHeading.textContent = strMeal || 'Título de la receta';

      const recetaButton = document.createElement('button');
      recetaButton.classList.add('btn', 'btn-danger', 'w-100');
      recetaButton.textContent = 'Ver Receta';
      // recetaButton.dataset.bsTarget = '#modal';
      // recetaButton.dataset.bsToggle = 'modal';
      recetaButton.onclick = () => seleccionarReceta(idMeal);

      recetaCardBody.appendChild(recetaHeading);
      recetaCardBody.appendChild(recetaButton);
      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);
      recetaContenedor.appendChild(recetaCard);
      resultadoRecetas.appendChild(recetaContenedor);
    });
  }

  function seleccionarReceta(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then(res => res.json())
      .then(data => mostrarRecetaModal(data.meals[0]))
      .catch(error => console.error('Error fetching recipes:', error));
  }

  function mostrarRecetaModal(receta) {
    if (!receta) {
      console.error('Receta no encontrada');
      return;
    }

    const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

    // Añadir contenido al modal
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');

    modalTitle.textContent = strMeal || 'Título de la receta';
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}" alt="Imagen de la receta ${strMeal}">
      <h3 class="my-3">Instrucciones</h3>
      <p>${strInstructions || 'Instrucciones no disponibles'}</p>
      <h3 class="my-3">Ingreidntes y Cantidades</h3>
    `;

    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group');
    // Mostrar cantidades e ingredientes
    for (let i = 1; i <= 10; i++) {
      if (receta[`strIngredient${i}`]) {
        const ingrediente = receta[`strIngredient${i}`] || 'Ingrediente no disponible';
        const cantidad = receta[`strMeasure${i}`] || 'Cantidad no disponible';

        const ingredienteLi = document.createElement('li');
        ingredienteLi.classList.add('list-group-item');
        ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

        listGroup.appendChild(ingredienteLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector('.modal-footer');
    limpiarHTML(modalFooter);

    // Botones de cerrar y favorito
    const btnFavorito = document.createElement('button');
    btnFavorito.classList.add('btn', 'btn-danger', 'col');
    btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Agregar Favorito';

    // localStorage
    btnFavorito.onclick = () => {
      if (existeStorage(idMeal)) {
        eliminarFavorito(idMeal);
        btnFavorito.textContent = 'Agregar Favorito';
        return;
      }

      agregarFavorito({
        id: idMeal,
        titulo: strMeal,
        img: strMealThumb,
      });
      btnFavorito.textContent = 'Eliminar Favorito';
    };

    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('btn', 'btn-secondary', 'col');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.onclick = () => modal.hide();

    modalFooter.appendChild(btnFavorito);
    modalFooter.appendChild(btnCerrar);

    // Muestra el modal
    modal.show();
  }

  function agregarFavorito(receta) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
  }

  function eliminarFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
  }

  function existeStorage(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    return favoritos.some(favorito => favorito.id === id);
  }

  function limpiarHTML(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

document.addEventListener('DOMContentLoaded', iniciarApp);
