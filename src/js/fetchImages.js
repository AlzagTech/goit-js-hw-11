import axios from 'axios';

const API_KEY = 'key=32574941-ff57db53a87475aec71f36ede';
const BASE_URL = 'https://pixabay.com/api/';

export async function fetchImages(searchQuery, currentPage, perPage) {
  const url = `${BASE_URL}?${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`;

  return axios.get(url).then(response => response.data);
}
