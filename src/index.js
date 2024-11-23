const refs = {
  searchForm: document.querySelector('.js-form'),
  inputWraper: document.querySelector('.js-wraper'),
  addCountry: document.querySelector('.js-add'),
  counryList: document.querySelector('.js-list'),
};

const markup =
  '<input type="text" name="country" placeholder="Enter country" class="text" />';

refs.searchForm.addEventListener('submit', onSearchBtnClick);
refs.addCountry.addEventListener('click', onAddBtnClick);

function onAddBtnClick() {
  refs.inputWraper.insertAdjacentHTML('beforeend', markup);
}

function onSearchBtnClick(evt) {
  evt.preventDefault();
  const data = new FormData(evt.currentTarget);
  const countries = data
    .getAll('country')
    .filter(country => country)
    .map(country => country.trim());

  getCountries(countries)
    .then(async resp => {
      const capitals = resp.map(({ capital }) => capital[0]);
      const weatherService = await getWeather(capitals);

      refs.counryList.innerHTML = createMarkup(weatherService);
    })
    .catch(err => console.log(err))
    .finally(() => {
      refs.inputWraper.innerHTML = markup;
      refs.searchForm.reset();
    });
}

async function getCountries(arr) {
  const URL = 'https://restcountries.com/v3.1/name/';

  const resps = arr.map(async item => {
    const resp = await fetch(`${URL}${item}`);
    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    return resp.json();
  });

  const data = await Promise.allSettled(resps);
  const countriesObj = data
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => value[0]);

  return countriesObj;
}

async function getWeather(arr) {
  const BASE_URL = 'http://api.weatherapi.com/v1';
  const API_KEY = 'a9b2b5b585064de1aab74606242609';

  const resps = arr.map(async city => {
    const params = new URLSearchParams({
      key: API_KEY,
      q: city,
    });

    const resp = await fetch(`${BASE_URL}/current.json?${params}`);

    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    return resp.json();
  });

  const data = await Promise.allSettled(resps);
  const objs = data
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => value);

  return objs;
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        current: {
          temp_c,
          condition: { icon, text },
        },
        location: { name, country },
      }) =>
        ` <li class="country-item">
          <div class="country-info">
            <h2 class="country">${country}</h2>
            <h3 class="capital">${name}</h3>
          </div>
          <img src="${icon}" alt="${text}" />
          <p>Text info: ${text}</p>
          <p>Temperature: ${temp_c} C&deg;</p>
        </li>`
    )
    .join('');
}
