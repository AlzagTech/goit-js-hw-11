import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchImages } from './js/fetchImages';

const refs = {
  form: document.querySelector('.search-form'),
  formBtn: document.querySelector('.search-form button'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
refs.loadMoreBtn.classList.add('visually-hidden');

let currentPage = 0;
let searchQuery = '';
const perPage = 40;

let gallery = new SimpleLightbox('.gallery a');

async function onFormSubmit(event) {
  event.preventDefault();
  refs.formBtn.blur();

  currentPage = 1;
  searchQuery = event.target.searchQuery.value.trim();

  refs.loadMoreBtn.classList.add('visually-hidden');

  if (!searchQuery) {
    return;
  }

  try {
    const response = await fetchImages(searchQuery, currentPage, perPage);

    if (response.totalHits === 0) {
      refs.gallery.innerHTML = '';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
    }

    refs.gallery.innerHTML = createGalleryMarkup(response.hits);
    gallery.refresh();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    if (response.totalHits <= perPage) {
      return;
    }

    refs.loadMoreBtn.classList.remove('visually-hidden');
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMoreBtnClick() {
  refs.loadMoreBtn.classList.add('visually-hidden');
  currentPage += 1;

  try {
    const response = await fetchImages(searchQuery, currentPage, perPage);

    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createGalleryMarkup(response.hits)
    );

    gallery.refresh();

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (response.totalHits <= currentPage * perPage) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      return;
    }
  } catch (error) {
    console.log(error);
  }

  refs.loadMoreBtn.classList.remove('visually-hidden');
  refs.loadMoreBtn.blur();
}

function createGalleryMarkup(array) {
  return array
    .map(item => {
      return `<a class="gallery__link" href="${item.largeImageURL}">
        <div class="photo-card">
          <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                <span>${item.likes}</span>
              </p>
              <p class="info-item">
                <b>Views</b>
                <span>${item.views}</span>
              </p>
              <p class="info-item">
                <b>Comments</b>
                <span>${item.comments}</span>
              </p>
              <p class="info-item">
                <b>Downloads</b>
                <span>${item.downloads}</span>
              </p>
            </div>
        </div>
        </a>`;
    })
    .join('');
}
