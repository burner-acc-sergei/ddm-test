<template>
  <main class="about wrapper">
    <h2>This is an about page.</h2>
    <p>
      This is a simple book search app built with <strong>Vue.js</strong> on the front end and a
      <strong>Nest.js</strong> backend. It allows users to search for books by title or keyword
      using the public <strong>Goodreads API</strong>.
    </p>
    <p>
      The UI is intentionally minimal — I wanted to keep it simple. Though, you can probably tell
      the first thing I added was a dark mode toggle. The app supports basic authentication and
      requires users to connect their Goodreads account to perform searches.
    </p>
    <p>
      This app was created by Sergei Lushchik as part of a take-home assignment for DotDash
      Meredith.
    </p>
  </main>
</template>

<style scoped>
.about {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
</style>
