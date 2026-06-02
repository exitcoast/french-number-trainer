# French Number Trainer

Lokalny trener rozumienia francuskich liczb 0-100.

## Tryby

- `0-100 normal`: ogólne ważone losowanie całego zakresu.
- `10-20 Core`: szybki drill liczb bazowych, które wracają później w 70-99.
- `70-99 Lab`: rodziny 70/80/90, kontrasty typu 67/77/97 i mix 70-99.
- `10-20 -> 70-99`: most typu 12/72/92, 17/77/97.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce.

Jeśli chcesz sprawdzić dokładnie to, co trafi na Cloudflare Pages:

```bash
node scripts/build-pages.mjs
```

Build publiczny trafia do `dist/`. Jeśli masz lokalnie npm, możesz też uruchomić `npm run preview`, żeby podejrzeć `dist/` przez Wrangler.

## Audio

Domyślnie strona używa przeglądarkowego TTS, bo cache audio jest pusty. Żeby zbudować lokalny cache z publicznego endpointu Langpractice:

```bash
node number-trainer/download_audio.mjs 4 160
```

Pierwszy argument to liczba wariantów audio na liczbę, drugi to opóźnienie między zapytaniami w ms. Po pobraniu powstanie `number-trainer/audio-cache.js`, a strona będzie działać offline lokalnie.

Audio z Langpractice traktuj jako materiał do prywatnej nauki. `number-trainer/audio-cache.js` jest ignorowany przez Git i nie trafia do domyślnego buildu Cloudflare Pages. Nie publikuj go przez `PUBLISH_AUDIO_CACHE=1` bez sprawdzenia warunków użycia.

## Algorytm

Każda liczba ma wagę. Nowe liczby pojawiają się często. Pomyłka, reveal, wolna odpowiedź i replay zwiększają wagę. Replay resetuje timer, więc przerwa na drzwi albo kawę nie niszczy statystyk czasu. Liczby trafiane szybko i regularnie dostają bardzo małą wagę, więc prawie znikają z treningu, ale nie wypadają całkowicie.
